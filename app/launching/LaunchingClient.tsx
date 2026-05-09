'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedLogo from '@/components/AnimatedLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const waitlistSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(60, 'First name must be 60 characters or less')
    .trim(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(60, 'Last name must be 60 characters or less')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or less')
    .email('Please enter a valid email')
    .trim(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export default function LaunchingClient() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'waitlist',
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          product_slug: null,
          size: null,
        }),
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to join the waitlist. Please try again.');
      }

      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onOwnerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ownerPassword) return;
    setOwnerLoading(true);
    setOwnerError(null);
    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ownerPassword }),
      });
      if (!response.ok) {
        const j = await response.json().catch(() => ({}));
        throw new Error(j?.error || 'Incorrect password.');
      }
      window.location.href = '/';
    } catch (err) {
      setOwnerError(err instanceof Error ? err.message : 'Incorrect password.');
      setOwnerLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex flex-col items-center text-center">
        <AnimatedLogo
          size={180}
          className="h-44 w-44 sm:h-52 sm:w-52"
        />
        <p className="mt-6 text-lg sm:text-xl font-handwritten font-bold text-[#111]/70">
          created to create
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-light tracking-tight text-[#111]">
          The Drop Is Coming
        </h1>
        <p className="mt-3 text-sm sm:text-base font-light text-[#111]/70">
          A new collection from Think Different. Enter the waitlist below to be first in line.
        </p>
      </div>

      <div className="mt-10 border border-[#111] bg-[#f9f9f7] p-6 sm:p-8">
        <h2 className="text-2xl font-light text-[#111]">Join the Waitlist</h2>
        <p className="mt-2 text-sm text-[#111]/70 font-light">
          Drop is locked. We&rsquo;ll notify you the moment it goes live.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Input
                  type="text"
                  id="launch-first-name"
                  placeholder="First name"
                  maxLength={60}
                  autoComplete="given-name"
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-[#111]/70">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  id="launch-last-name"
                  placeholder="Last name"
                  maxLength={60}
                  autoComplete="family-name"
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-[#111]/70">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Input
                type="email"
                id="launch-email"
                placeholder="Email"
                maxLength={254}
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#111]/70">{errors.email.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-[#111]/70">{error}</p>}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Joining…' : 'Join Waitlist'}
            </Button>
          </form>
        ) : (
          <div className="mt-6 border border-[#111] p-5 text-center">
            <p className="text-[#111] font-light">You&rsquo;re on the waitlist.</p>
            <p className="mt-2 text-sm text-[#111]/70 font-light">
              Keep an eye on your inbox.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[#111]/70">
        <a
          href="https://instagram.com/uthinkdifferent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-light transition-all hover:text-[#111] hover:underline"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-light text-sm">@uthinkdifferent</span>
        </a>
        <a
          href="https://tiktok.com/@uthinkdifferent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-light transition-all hover:text-[#111] hover:underline"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
          <span className="font-light text-sm">@uthinkdifferent</span>
        </a>
      </div>

      <div className="mt-12 flex flex-col items-center text-center">
        {!showOwnerLogin ? (
          <button
            type="button"
            onClick={() => setShowOwnerLogin(true)}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] font-light text-[#111]/40 hover:text-[#111]/80 transition-colors"
            aria-label="Enter password to access the site"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Password Protected
          </button>
        ) : (
          <form onSubmit={onOwnerSubmit} className="w-full max-w-xs space-y-3">
            <Input
              type="password"
              id="owner-password"
              placeholder="Password"
              autoComplete="current-password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              maxLength={200}
              autoFocus
            />
            {ownerError && (
              <p className="text-xs text-[#111]/70 text-left">{ownerError}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={ownerLoading || !ownerPassword}
              >
                {ownerLoading ? 'Unlocking…' : 'Unlock'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowOwnerLogin(false);
                  setOwnerPassword('');
                  setOwnerError(null);
                }}
                disabled={ownerLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
