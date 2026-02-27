import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getGitHubAppOctokit, getRepoInfo } from '@/lib/github-app';
import type { PageStructure } from '@/lib/types/builder';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const proposalId = id;

    // Get proposal from database
    const { data: proposal, error: fetchError } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Initialize GitHub client using App authentication
    let octokit;
    try {
      octokit = await getGitHubAppOctokit();
    } catch (error: any) {
      const msg = error.message || 'Failed to initialize GitHub App';
      const isKeyError = /Invalid keyData|Invalid character|invalid key|malformed|private key/i.test(msg);
      return NextResponse.json(
        {
          error: isKeyError
            ? 'GitHub App private key invalid. In Vercel: paste the full key as ONE line with NO newlines (same as .env.local). Avoid \\n - use the raw single-line format.'
            : msg,
        },
        { status: 500 }
      );
    }

    const { owner: repoOwner, repo: repoName } = getRepoInfo();

    // Verify repository access
    try {
      await octokit.rest.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
    } catch (error: any) {
      if (error.status === 404) {
        return NextResponse.json(
          { error: `Repository ${repoOwner}/${repoName} not found or app doesn't have access` },
          { status: 404 }
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'GitHub App authentication failed. Please check your GitHub App credentials' },
          { status: 401 }
        );
      }
      throw error;
    }

    // Generate code from page structure
    const code = generatePageCode(proposal.page_structure as PageStructure);

    // Create a new branch
    let branchName = `proposal-${proposalId.slice(0, 8)}-${Date.now()}`;
    
    // Try to get default branch, fallback to 'main' or 'master'
    let baseBranch = 'main';
    try {
      const { data: repo } = await octokit.rest.repos.get({
        owner: repoOwner,
        repo: repoName,
      });
      baseBranch = repo.default_branch || 'main';
    } catch (error) {
      console.warn('Could not fetch default branch, using main');
      baseBranch = 'main';
    }

    // Get latest commit SHA
    let refData;
    try {
      const response = await octokit.rest.git.getRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${baseBranch}`,
      });
      refData = response.data;
    } catch (error: any) {
      // Try 'master' if 'main' fails
      if (baseBranch === 'main') {
        try {
          const response = await octokit.rest.git.getRef({
            owner: repoOwner,
            repo: repoName,
            ref: 'heads/master',
          });
          refData = response.data;
          baseBranch = 'master';
        } catch (masterError) {
          throw new Error(`Could not find branch 'main' or 'master'. Error: ${error.message}`);
        }
      } else {
        throw error;
      }
    }

    // Create new branch
    try {
      await octokit.rest.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });
    } catch (error: any) {
      if (error.status === 422 && error.message?.includes('already exists')) {
        // Branch already exists, try with a new timestamp
        const newBranchName = `proposal-${proposalId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        await octokit.rest.git.createRef({
          owner: repoOwner,
          repo: repoName,
          ref: `refs/heads/${newBranchName}`,
          sha: refData.object.sha,
        });
        branchName = newBranchName;
      } else {
        throw error;
      }
    }

    // Get current file SHA (required when updating existing file per GitHub API)
    let fileSha: string | undefined;
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: 'app/page.tsx',
        ref: branchName,
      });
      if (fileData && !Array.isArray(fileData) && 'sha' in fileData) {
        fileSha = fileData.sha;
      }
    } catch {
      // File may not exist yet (create vs update) - sha not required for new files
    }

    // Create or update file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: 'app/page.tsx',
      message: `Proposal: ${proposal.title}`,
      content: Buffer.from(code).toString('base64'),
      branch: branchName,
      ...(fileSha && { sha: fileSha }),
    });

    // Create PR
    const { data: pr } = await octokit.rest.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: `Proposal: ${proposal.title}`,
      head: branchName,
      base: baseBranch,
      body: proposal.description || `Proposal: ${proposal.title}\n\nThis PR was automatically generated from the admin builder.`,
    });

    // Update proposal with PR info
    await supabaseAdmin
      .from('proposals')
      .update({
        status: 'pending',
        github_pr_number: pr.number,
        github_pr_url: pr.html_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    return NextResponse.json({
      prNumber: pr.number,
      prUrl: pr.html_url,
    });
  } catch (error: any) {
    console.error('Failed to submit proposal:', error);
    const msg = error.message || 'Failed to submit proposal';
    const isKeyError = /Invalid keyData|Invalid character|invalid key|malformed|private key/i.test(msg);
    return NextResponse.json(
      {
        error: isKeyError
          ? 'GitHub App private key invalid. In Vercel: paste the full key as ONE line with NO newlines (same as .env.local). Avoid \\n - use the raw single-line format.'
          : msg,
      },
      { status: 500 }
    );
  }
}

function generatePageCode(pageStructure: PageStructure): string {
  const components = pageStructure.components || [];
  
  // Generate component JSX
  const componentJSX = components
    .sort((a, b) => a.order - b.order)
    .map((comp) => renderComponent(comp))
    .join('\n        ');

  return `'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import EmailOptInModal from '@/components/EmailOptInModal';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const doodleRef = useRef<HTMLDivElement>(null);

  // Check if modal has been shown before
  useEffect(() => {
    const modalShown = localStorage.getItem('thinkdifferent_modal_shown');
    if (modalShown === 'true') {
      return; // Don't show modal if it's already been shown
    }

    // Show modal after 4 seconds
    const timer = setTimeout(() => {
      setIsModalOpen(true);
      localStorage.setItem('thinkdifferent_modal_shown', 'true');
    }, 4000);

    // Show modal after 50% scroll
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50 && !hasScrolled) {
        setHasScrolled(true);
        setIsModalOpen(true);
        localStorage.setItem('thinkdifferent_modal_shown', 'true');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    localStorage.setItem('thinkdifferent_modal_shown', 'true');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.setItem('thinkdifferent_modal_shown', 'true');
  };

  // Scroll fade-in for future doodles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = doodleRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <>
      <main className="min-h-screen bg-[#f9f9f7]">
        ${componentJSX}
        
        {/* Placeholder for future doodles - scroll fade-in ready */}
        <div ref={doodleRef} className="scroll-fade-in">
          {/* Doodles will be added here in the future */}
        </div>
      </main>

      <EmailOptInModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
`;
}

function renderComponent(comp: any): string {
  switch (comp.type) {
    case 'hero':
      const subtitle = escapeString(comp.props.subtitle || 'created to create');
      const description = escapeString(comp.props.description || 'Being creative is a necessity to life');
      return `<section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-2xl">
            <div className="mb-8 micro-fade-in">
              <Image
                src="/thinkdifferent_logo.png"
                alt="Think Different"
                width={200}
                height={200}
                className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48"
                priority
              />
            </div>
            <div className="space-y-4">
              <p className="text-xl sm:text-2xl text-[#111]/70 font-handwritten font-bold micro-fade-in-simple">
                {${JSON.stringify(subtitle)}}
              </p>
              <p className="text-base sm:text-lg text-[#111]/60 font-handwritten micro-fade-in-simple">
                {${JSON.stringify(description)}}
              </p>
            </div>
          </div>
        </section>`;

    case 'text':
      const content = escapeString(comp.props.content || 'Your text here');
      const size = comp.props.size || 'base';
      return `<section className="px-4 py-8">
          <p className="text-${size} text-[#111] max-w-2xl mx-auto">
            {${JSON.stringify(content)}}
          </p>
        </section>`;

    case 'button':
      const buttonText = escapeString(comp.props.text || 'Click me');
      const buttonVariant = comp.props.variant || 'primary';
      if (comp.props.href && comp.props.href !== '#') {
        const href = escapeString(comp.props.href);
        return `<section className="px-4 py-8 text-center">
          <a href={${JSON.stringify(href)}}>
            <Button variant="${buttonVariant}" className="text-lg px-8 py-4">
              {${JSON.stringify(buttonText)}}
            </Button>
          </a>
        </section>`;
      }
      return `<section className="px-4 py-8 text-center">
          <Button variant="${buttonVariant}" onClick={handleOpenModal} className="text-lg px-8 py-4">
            {${JSON.stringify(buttonText)}}
          </Button>
        </section>`;

    case 'image':
      const src = escapeString(comp.props.src || '/thinkdifferent_logo.png');
      const alt = escapeString(comp.props.alt || 'Image');
      return `<section className="px-4 py-8 text-center">
          <Image
            src={${JSON.stringify(src)}}
            alt={${JSON.stringify(alt)}}
            width={${comp.props.width || 200}}
            height={${comp.props.height || 200}}
            className="mx-auto"
          />
        </section>`;

    case 'values':
      const items = comp.props.items || [];
      const itemsJSX = items.map((item: any, i: number) => {
        const itemTitle = escapeString(item.title || '');
        const itemDesc = escapeString(item.description || '');
        return `
              <div key="${i}" className="space-y-2">
                <h3 className="text-lg font-light text-[#111]">
                  {${JSON.stringify(itemTitle)}}
                </h3>
                <p className="text-sm text-[#111]/70 font-light">
                  {${JSON.stringify(itemDesc)}}
                </p>
              </div>`;
      }).join('');
      return `<section className="px-4 py-8">
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              ${itemsJSX}
            </div>
          </div>
        </section>`;

    case 'instagram-link':
      const username = comp.props.username || 'uthinkdifferent';
      const linkText = escapeString(comp.props.text || `@${username}`);
      return `<section className="px-4 py-8 text-center">
          <a
            href={${JSON.stringify(`https://instagram.com/${username}`)}}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#111]/70 hover:text-[#111] hover:underline transition-all font-light"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-light">{${JSON.stringify(linkText)}}</span>
          </a>
        </section>`;

    default:
      return `<!-- Component ${comp.type} not implemented -->`;
  }
}

function escapeString(str: string): string {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return str;
}
