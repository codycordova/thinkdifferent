'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f9f9f7]/80 backdrop-blur-md border-b border-[#111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/thinkdifferent_logo.png"
              alt="Think Different"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-light text-[#111] hover:underline transition-all"
            >
              Home
            </Link>
            <Link
              href="/return-policy"
              className="text-sm font-light text-[#111] hover:underline transition-all"
            >
              Return Policy
            </Link>
            <a
              href="https://instagram.com/uthinkdifferent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-[#111] hover:underline transition-all"
            >
              @uthinkdifferent
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-sm text-[#111] hover:opacity-70 transition-opacity"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#111]">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-base font-light text-[#111] hover:underline transition-all"
            >
              Home
            </Link>
            <Link
              href="/return-policy"
              onClick={() => setIsOpen(false)}
              className="block text-base font-light text-[#111] hover:underline transition-all"
            >
              Return Policy
            </Link>
            <a
              href="https://instagram.com/uthinkdifferent"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block text-base font-light text-[#111] hover:underline transition-all"
            >
              @uthinkdifferent
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
