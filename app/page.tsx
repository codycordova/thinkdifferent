'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EmailOptInModal from '@/components/EmailOptInModal';
import { Button } from '@/components/ui/Button';
import { PRODUCTS } from '@/lib/products';
import ProductPieceTitle from '@/components/ProductPieceTitle';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const doodleRef = useRef<HTMLDivElement>(null);
  const product = useMemo(() => PRODUCTS.at(0), []);

  useEffect(() => {
    const modalShown = localStorage.getItem('thinkdifferent_modal_shown');
    if (modalShown === 'true') {
      return;
    }

    const timer = setTimeout(() => {
      setIsModalOpen(true);
      localStorage.setItem('thinkdifferent_modal_shown', 'true');
    }, 4000);

    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50 && !hasScrolled) {
        setHasScrolled(true);
        setIsModalOpen(true);
        localStorage.setItem('thinkdifferent_modal_shown', 'true');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    localStorage.setItem('thinkdifferent_modal_shown', 'true');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.setItem('thinkdifferent_modal_shown', 'true');
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = doodleRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-[#f9f9f7]">
        {/* OG-style hero: brand first */}
        <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col items-center text-center">
            <div className="mb-8 micro-fade-in">
              <Image
                src="/thinkdifferent_logo.png"
                alt="Think Different"
                width={200}
                height={200}
                className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48"
                priority
              />
            </div>

            <div className="space-y-4">
              <p className="text-xl sm:text-2xl text-[#111]/70 font-handwritten font-bold micro-fade-in-simple">
                created to create
              </p>
              <p className="text-base sm:text-lg text-[#111]/60 font-handwritten micro-fade-in-simple">
                Being creative is a necessity to life
              </p>
            </div>

            {product ? (
              <Link
                href={`/products/${product.slug}`}
                className="group mx-auto mt-12 block w-full max-w-sm"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-transparent">
                  <Image
                    src={product.images[0]?.src ?? '/frontside_transparent.PNG'}
                    alt={product.images[0]?.alt ?? `${product.title} ${product.descriptor}`}
                    width={1200}
                    height={1500}
                    className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.01] sm:p-8"
                  />
                </div>
                <div className="pt-6 text-center">
                  <ProductPieceTitle title={product.title} as="p" className="text-lg sm:text-xl leading-snug" />
                  <p className="mt-1 text-sm font-light text-[#111]/80">{product.descriptor}</p>
                  <p className="mt-0.5 text-xs font-light text-[#111]/70">Color: {product.color}</p>
                  <p className="mt-3 inline-block rounded-sm bg-sky-100 px-2 py-1 text-sm font-light text-[#111]">
                    ${(product.priceCents / 100).toFixed(2)}
                  </p>
                  <p className="mt-4 text-xs font-light uppercase tracking-[0.2em] text-[#111]/50">
                    View product →
                  </p>
                </div>
              </Link>
            ) : (
              <div className="mx-auto mt-12 w-full max-w-sm text-center">
                <p className="text-sm font-light text-[#111]/70">Shop updates are on the way.</p>
                <Link
                  href="/products"
                  className="mt-4 inline-block text-base font-light text-[#111] underline decoration-[#111]/30 underline-offset-4 transition-colors hover:text-[#111]/80"
                >
                  Go to shop →
                </Link>
              </div>
            )}

            <div className="mt-8">
              <Button variant="primary" onClick={handleOpenModal} className="text-lg px-8 py-4">
                Get 10% Off
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <a
                href="https://instagram.com/uthinkdifferent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-light text-[#111]/70 transition-all hover:text-[#111] hover:underline"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-light">@uthinkdifferent</span>
              </a>
              <a
                href="https://tiktok.com/@uthinkdifferent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-light text-[#111]/70 transition-all hover:text-[#111] hover:underline"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="font-light">@uthinkdifferent</span>
              </a>
            </div>
          </div>
        </section>

        <div ref={doodleRef} className="scroll-fade-in" />
      </main>

      <EmailOptInModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
