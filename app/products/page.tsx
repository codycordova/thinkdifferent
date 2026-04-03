import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, getShopAvailabilitySummary } from '@/lib/products';

export const metadata = {
  title: 'Shop | Think Different',
};

export default function ProductsPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#111]">Shop</h1>
        </header>

        <div className="flex flex-col gap-8">
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group block"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_15%,rgba(17,17,17,0.06),transparent_55%)]">
                <Image
                  src={p.images[0]?.src ?? '/createdtocreate_front-Picsart-BackgroundRemover.jpg'}
                  alt={p.images[0]?.alt ?? `${p.title} ${p.descriptor}`}
                  width={1200}
                  height={1500}
                  className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.02] sm:p-8"
                  priority
                />
              </div>
              <div className="pt-6 sm:pt-8">
                <p className="text-base font-light leading-snug text-[#111]">{p.title}</p>
                <p className="mt-1 text-sm font-light text-[#111]/80">{p.descriptor}</p>
                <p className="mt-0.5 text-xs font-light text-[#111]/70">Color: {p.color}</p>
                <p className="mt-3 inline-block rounded-sm bg-sky-100 px-2 py-1 text-sm font-light text-[#111]">
                  ${(p.priceCents / 100).toFixed(2)}
                </p>
                <p className="mt-3 text-xs text-[#111]/70 font-light leading-relaxed">
                  {getShopAvailabilitySummary(p)}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#111]/50 font-light">
                  View product →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
