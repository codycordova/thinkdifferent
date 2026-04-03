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
    <div className="mt-8 border border-[#111] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-md">
          <p className="text-sm text-[#111]/70 font-light">Select size</p>
          <div className="mt-3 flex flex-wrap gap-2">
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
                    'px-3 py-2 text-sm border font-light transition-colors',
                    soldOut
                      ? 'cursor-not-allowed border-[#111]/25 text-[#111]/35 bg-transparent'
                      : selected
                        ? 'border-[#111] bg-[#111] text-[#f9f9f7]'
                        : 'border-[#111] text-[#111] hover:bg-[#111]/5',
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
            <p className="mt-3 text-xs font-light text-red-700">{stockHint}</p>
          )}
          {!canBuy && (
            <p className="mt-2 text-xs text-[#111]/60 font-light">
              Pick an in-stock size to continue.
            </p>
          )}
        </div>

        <div className="sm:text-right sm:min-w-[200px]">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
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
