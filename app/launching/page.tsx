import { Suspense } from 'react';
import LaunchingClient from './LaunchingClient';

export const metadata = {
  title: 'Coming Soon | Think Different',
  description: 'Created to create. The drop is launching soon — join the waitlist.',
  robots: { index: false, follow: false },
};

export default function LaunchingPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] px-4 py-10 sm:py-14">
      <Suspense
        fallback={
          <div className="mx-auto mt-24 max-w-md text-center text-sm font-light text-[#111]/60">
            Loading…
          </div>
        }
      >
        <LaunchingClient />
      </Suspense>
    </main>
  );
}
