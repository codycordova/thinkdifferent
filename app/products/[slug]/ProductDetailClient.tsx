'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductSize } from '@/lib/products';
import {
  SIZE_ORDER,
  getDefaultSize,
  getStock,
  stockLabelForSize,
} from '@/lib/products';
import { Button } from '@/components/ui/Button';

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const sizes = useMemo(() => {
    const set = new Set(product.sizes);
    return SIZE_ORDER.filter((s) => set.has(s));
  }, [product.sizes]);

  const [size, setSize] = useState<ProductSize>(() => getDefaultSize(product));

  const stockForSelection = getStock(product, size);
  const stockHint = stockLabelForSize(product, size);
  const canBuy = stockForSelection > 0;

  const goToWaitlist = () => {
    if (!canBuy) return;
    const params = new URLSearchParams({
      product: product.slug,
      size,
    });
    router.push(`/waitlist?${params.toString()}`);
  };

  return (
    <div className="mt-10 sm:mt-12">
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full max-w-md flex-col items-center lg:items-start">
          <p className="text-sm text-[#111]/70 font-light">Select size</p>
          <div className="mt-3 flex w-full flex-wrap justify-center gap-2 lg:justify-start">
            {sizes.map((s) => {
              const qty = getStock(product, s);
              const soldOut = qty <= 0;
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    if (!soldOut) setSize(s);
                  }}
                  className={[
                    'rounded-sm px-3 py-2 text-sm font-light transition-colors',
                    soldOut
                      ? 'cursor-not-allowed bg-[#111]/[0.04] text-[#111]/35'
                      : selected
                        ? 'bg-[#111] text-[#f9f9f7]'
                        : 'bg-[#111]/[0.06] text-[#111] hover:bg-[#111]/10',
                  ].join(' ')}
                  aria-pressed={selected}
                  aria-disabled={soldOut}
                  title={soldOut ? `${s} — Sold out` : undefined}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {stockHint && (
            <p className="mt-3 text-center text-xs font-light text-red-700 lg:text-left">{stockHint}</p>
          )}
          {!canBuy && (
            <p className="mt-2 text-center text-xs text-[#111]/60 font-light lg:text-left">
              Pick an in-stock size to continue.
            </p>
          )}
        </div>

        <div className="flex w-full justify-center lg:w-auto lg:min-w-[200px] lg:justify-end">
          <Button
            variant="primary"
            className="w-full lg:w-auto"
            disabled={!canBuy}
            onClick={goToWaitlist}
          >
            Buy now
          </Button>
        </div>
      </div>
    </div>
  );
}
