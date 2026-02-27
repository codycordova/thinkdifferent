import { createPrivateKey } from 'node:crypto';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

/**
 * Normalize private key and convert PKCS#1 (RSA) to PKCS#8 for OpenSSL 3 compatibility
 */
function normalizePrivateKey(key: string): string {
  let parsed = key.trim();

  if (!parsed.startsWith('-----BEGIN')) {
    try {
      parsed = Buffer.from(parsed, 'base64').toString('utf-8');
    } catch {
      throw new Error('Failed to decode base64 private key.');
    }
  }

  parsed = parsed.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If body is one long line, wrap to 64 chars (valid PEM)
  const beginMatch = parsed.match(/-----BEGIN [^-]+-----\n?/);
  const endMatch = parsed.match(/\n?-----END [^-]+-----$/);
  if (beginMatch && endMatch) {
    const body = parsed.slice(beginMatch[0].length, parsed.length - endMatch[0].length).replace(/\s/g, '');
    if (body.length > 0 && !body.includes('\n')) {
      const wrapped = body.match(/.{1,64}/g)?.join('\n') ?? body;
      parsed = `${beginMatch[0]}${wrapped}\n${endMatch[0]}`;
    }
  }

  // PKCS#1 (RSA PRIVATE KEY) is often rejected by OpenSSL 3 - convert to PKCS#8
  if (parsed.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    const pkcs8Error =
      'Your private key is in PKCS#1 format (RSA PRIVATE KEY). Node/OpenSSL 3 requires PKCS#8. ' +
      'Convert it: save the key to a .pem file, then run: openssl pkcs8 -topk8 -nocrypt -inform PEM -in key.pem -out key_pkcs8.pem ' +
      'Then put the contents of key_pkcs8.pem (single line with \\n for newlines) in GITHUB_APP_PRIVATE_KEY.';

    try {
      const keyObj = createPrivateKey({ key: parsed, format: 'pem', type: 'pkcs1' });
      return keyObj.export({ format: 'pem', type: 'pkcs8' }) as string;
    } catch {
      try {
        const match = parsed.match(/-----BEGIN RSA PRIVATE KEY-----([\s\S]*?)-----END RSA PRIVATE KEY-----/);
        if (match) {
          const der = Buffer.from(match[1].replace(/\s/g, ''), 'base64');
          const keyObj = createPrivateKey({ key: der, format: 'der', type: 'pkcs1' });
          return keyObj.export({ format: 'pem', type: 'pkcs8' }) as string;
        }
      } catch {
        // ignore
      }
      throw new Error(pkcs8Error);
    }
  }

  return parsed;
}

/**
 * Get an authenticated Octokit instance using GitHub App authentication
 * This handles token generation and refresh automatically
 */
export async function getGitHubAppOctokit(): Promise<Octokit> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    throw new Error(
      'GitHub App credentials not configured. Please set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_INSTALLATION_ID in .env.local'
    );
  }

  const privateKeyParsed = normalizePrivateKey(privateKey);

  // Parse installation ID (should be numeric)
  const installationIdNum = parseInt(installationId, 10);
  if (isNaN(installationIdNum)) {
    throw new Error(
      `GITHUB_APP_INSTALLATION_ID must be a number. Got: ${installationId}. ` +
        `Find it in the URL when viewing your app installation: /settings/installations/[NUMBER]`
    );
  }

  // Pass createAppAuth as authStrategy and options as auth (per @octokit/auth-app docs)
  const appIdNum = parseInt(appId, 10);
  if (isNaN(appIdNum)) {
    throw new Error('GITHUB_APP_ID must be a number.');
  }

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appIdNum,
      privateKey: privateKeyParsed,
      installationId: installationIdNum,
    },
  });
}

/**
 * Get repository owner and name from environment or defaults
 */
export function getRepoInfo() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || 'codycordova',
    repo: process.env.GITHUB_REPO_NAME || 'thinkdifferent',
  };
}
