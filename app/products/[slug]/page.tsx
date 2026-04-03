import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products';
import ProductDetailClient from './ProductDetailClient';

type Params = { slug: string };

export default async function ProductDetailPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return notFound();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 text-center lg:text-left">
          <Link
            href="/products"
            className="text-sm text-[#111]/70 hover:text-[#111] hover:underline transition-all font-light"
          >
            ← Back to products
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="order-2 grid gap-4 lg:order-1">
            {product.images.map((img) => (
              <div
                key={img.src}
                className="overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(17,17,17,0.06),transparent_55%)]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={1400}
                  height={1750}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            ))}
          </div>

          <div className="order-1 text-center lg:order-2 lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-light text-[#111] leading-snug">{product.title}</h1>
            <p className="mt-2 text-base font-light text-[#111]/80">{product.descriptor}</p>
            <p className="mt-1 text-sm font-light text-[#111]/70">
              Color: {product.color}
            </p>
            <p className="mt-4 inline-block rounded-sm bg-sky-100 px-3 py-2 text-xl font-light text-[#111]">
              ${(product.priceCents / 100).toFixed(2)}
            </p>

            <ProductDetailClient product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
