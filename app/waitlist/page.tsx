import Link from 'next/link';
import { Suspense } from 'react';
import WaitlistClient from './WaitlistClient';

export const metadata = {
  title: 'Waitlist | Think Different',
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/products"
          className="text-sm text-[#111]/70 hover:text-[#111] hover:underline transition-all font-light"
        >
          ← Back to products
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl sm:text-4xl font-light text-[#111]">
            Drop Locked
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#111]/70 font-light">
            We’re not taking payments yet. Join the waitlist to get notified when buying opens.
          </p>
        </div>

        <Suspense fallback={<div className="mt-8 text-sm text-[#111]/70 font-light">Loading…</div>}>
          <WaitlistClient />
        </Suspense>
      </div>
    </main>
  );
}

