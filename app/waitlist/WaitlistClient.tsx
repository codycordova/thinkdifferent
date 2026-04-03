'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

const DROP_TARGET_STORAGE_KEY = 'thinkdifferent_drop_target_ms';
const ONE_SECOND_MS = 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function parseDropTargetMs(): number | null {
  const raw = process.env.NEXT_PUBLIC_DROP_DATETIME;
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : null;
}

function getOrCreateDropTargetMs(): number {
  const envTarget = parseDropTargetMs();
  if (envTarget) return envTarget;

  const existing = window.localStorage.getItem(DROP_TARGET_STORAGE_KEY);
  if (existing) {
    const parsed = Number(existing);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const created = Date.now() + SEVEN_DAYS_MS;
  window.localStorage.setItem(DROP_TARGET_STORAGE_KEY, String(created));
  return created;
}

function computeCountdown(targetMs: number): Countdown {
  const diff = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, done: diff === 0 };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function CountdownBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#111] bg-[#f9f9f7] px-4 py-3 text-center">
      <div className="text-2xl sm:text-3xl font-light tracking-wider text-[#111]">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#111]/70 font-light">
        {label}
      </div>
    </div>
  );
}

export default function WaitlistClient() {
  const searchParams = useSearchParams();
  const product_slug = useMemo(() => searchParams.get('product') ?? null, [searchParams]);
  const size = useMemo(() => searchParams.get('size') ?? null, [searchParams]);

  const [targetMs, setTargetMs] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<Countdown>(() => ({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  }));

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  useEffect(() => {
    const ms = getOrCreateDropTargetMs();
    setTargetMs(ms);
    setCountdown(computeCountdown(ms));

    const id = window.setInterval(() => {
      setCountdown(computeCountdown(ms));
    }, ONE_SECOND_MS);

    return () => window.clearInterval(id);
  }, []);

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
          product_slug,
          size,
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

  return (
    <div className="mt-8 border border-[#111] bg-[#f9f9f7] p-6 sm:p-8">
      <div className="grid gap-3 sm:grid-cols-4">
        <CountdownBox label="Days" value={String(countdown.days)} />
        <CountdownBox label="Hours" value={pad2(countdown.hours)} />
        <CountdownBox label="Minutes" value={pad2(countdown.minutes)} />
        <CountdownBox label="Seconds" value={pad2(countdown.seconds)} />
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-light text-[#111]">Join Waitlist</h2>
        <p className="mt-2 text-sm text-[#111]/70 font-light">
          Drop is locked. Enter your info and we’ll notify you when it’s live.
        </p>
        {(product_slug || size) && (
          <p className="mt-3 text-xs text-[#111]/60 font-light">
            {product_slug ? `Product: ${product_slug}` : ''}
            {product_slug && size ? ' • ' : ''}
            {size ? `Size: ${size}` : ''}
          </p>
        )}
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                type="text"
                id="waitlist-first-name"
                placeholder="First name"
                maxLength={60}
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-[#111]/70">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Input
                type="text"
                id="waitlist-last-name"
                placeholder="Last name"
                maxLength={60}
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
              id="waitlist-email"
              placeholder="Email"
              maxLength={254}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#111]/70">{errors.email.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-[#111]/70">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Waitlist'}
          </Button>
        </form>
      ) : (
        <div className="mt-6 border border-[#111] p-5 text-center">
          <p className="text-[#111] font-light">You’re on the waitlist.</p>
          <p className="mt-2 text-sm text-[#111]/70 font-light">
            Keep an eye on your inbox.
          </p>
        </div>
      )}

      {targetMs && parseDropTargetMs() && (
        <p className="mt-6 text-[11px] text-[#111]/50 font-light">
          Countdown target from <code>NEXT_PUBLIC_DROP_DATETIME</code>.
        </p>
      )}
    </div>
  );
}

