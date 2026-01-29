'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const leadSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be 20 characters or less')
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length >= 10;
      },
      {
        message: 'Please provide a valid phone number (at least 10 digits)',
      }
    ),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface EmailOptInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailOptInModal({ isOpen, onClose }: EmailOptInModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setError(null);
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    setError(null);

    // Always show the discount code, even if API fails
    // Try to save to database in the background
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone.trim(),
          discount_code: 'THINK10',
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.warn('Failed to save to database:', responseData.error);
        // Still show discount code even if save fails
      }
    } catch (err) {
      console.error('Form submission error:', err);
      // Still show discount code even if API call fails
    }

    // Always show success and discount code
    setIsSubmitted(true);
    // Mark modal as shown so it doesn't appear again
    localStorage.setItem('thinkdifferent_modal_shown', 'true');
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#f9f9f7] rounded-sm border border-[#111] shadow-lg p-6 sm:p-8">
        {!isSubmitted ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#111] hover:opacity-70 transition-opacity"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-light text-[#111] mb-2">
              Get 10% Off
            </h2>
            <p className="text-[#111]/70 mb-6 font-light">
              Enter your name and phone number to activate your discount code
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  type="text"
                  id="lead-name"
                  name="name"
                  placeholder="Your name"
                  maxLength={100}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[#111]/70">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="tel"
                  id="lead-phone"
                  name="phone"
                  placeholder="Phone number"
                  maxLength={20}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-[#111]/70">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-[#111]/70">{error}</p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Activating...' : 'Activate Discount'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#111]">
                <svg
                  className="h-8 w-8 text-[#111]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-light text-[#111] mb-2">
              Discount Activated!
            </h2>
            <p className="text-[#111]/70 mb-6 font-light">
              Your discount code is:
            </p>
            <div className="mb-6">
              <div 
                className="inline-block border-2 border-[#111] p-4 cursor-pointer hover:bg-[#111]/5 transition-colors relative group"
                onClick={() => {
                  navigator.clipboard.writeText('THINK10');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Click to copy"
              >
                <p className="text-3xl font-light text-[#111] tracking-wider">THINK10</p>
                {copied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#111] text-[#f9f9f7] text-xs px-2 py-1 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#111]/70 font-light">
                10% off your first purchase
              </p>
              <p className="mt-1 text-xs text-[#111]/50 font-light">
                Click code to copy
              </p>
            </div>
            <Button onClick={onClose} variant="primary" className="w-full">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
