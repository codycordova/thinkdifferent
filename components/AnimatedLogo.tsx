'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { animate, createTimeline, steps, utils } from 'animejs';

type Props = {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
};

/**
 * Brand logo with a Y2K / vaporwave entrance + ambient loop:
 *   - Chromatic-aberration RGB split that snaps together on mount
 *   - Slow scale "breathe" + micro-rotate wobble
 *   - Iridescent conic-gradient halo rotating behind it
 *   - Random glitch flashes every ~6-9s
 *   - Respects prefers-reduced-motion (renders static)
 */
export default function AnimatedLogo({
  src = '/thinkdifferent_logo.png',
  alt = 'Think Different',
  size = 200,
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    const halo = haloRef.current;
    if (!wrap || !img || !halo) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      utils.set(img, { opacity: 1, scale: 1, '--rgb': '0px', rotate: 0 });
      utils.set(halo, { opacity: 0.35 });
      return;
    }

    utils.set(img, { opacity: 0, scale: 0.85, '--rgb': '14px', rotate: 0 });
    utils.set(halo, { opacity: 0, scale: 0.6, rotate: 0 });

    animate(halo, {
      opacity: [0, 0.45],
      scale: [0.6, 1],
      duration: 1600,
      ease: 'outExpo',
    });

    animate(halo, {
      rotate: '+=360',
      duration: 22000,
      ease: 'linear',
      loop: true,
    });

    const entrance = createTimeline({
      defaults: { ease: 'outExpo' },
    });

    const AMBIENT_START = 1400;

    entrance
      .add(
        img,
        {
          opacity: [0, 1],
          scale: [0.85, 1],
          '--rgb': ['14px', '0px'],
          duration: 1200,
        },
        0
      )
      .add(
        img,
        {
          scale: [{ to: 1.02, duration: 4000 }, { to: 1, duration: 4000 }],
          ease: 'inOutSine',
          loop: true,
        },
        AMBIENT_START
      )
      .add(
        img,
        {
          rotate: [
            { to: -1, duration: 6000 },
            { to: 1, duration: 6000 },
            { to: 0, duration: 3000 },
          ],
          ease: 'inOutSine',
          loop: true,
        },
        AMBIENT_START
      );

    let cancelled = false;
    let glitchTimer: number | undefined;

    const scheduleGlitch = () => {
      if (cancelled) return;
      const wait = 5000 + Math.random() * 4000;
      glitchTimer = window.setTimeout(() => {
        if (cancelled || !img) return;
        animate(img, {
          '--rgb': [
            { to: '10px', duration: 70 },
            { to: '-6px', duration: 70 },
            { to: '4px', duration: 70 },
            { to: '0px', duration: 100 },
          ],
          ease: steps(1),
          onComplete: scheduleGlitch,
        });
      }, wait);
    };

    scheduleGlitch();

    return () => {
      cancelled = true;
      if (glitchTimer) window.clearTimeout(glitchTimer);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={false}
    >
      <div
        ref={haloRef}
        aria-hidden="true"
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, #ff5ad9, #5ad7ff, #c0a6ff, #ffd166, #ff5ad9)',
          filter: 'blur(38px) saturate(1.1)',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      />
      <div
        ref={imgRef}
        className="relative"
        style={{
          width: size,
          height: size,
          opacity: 0,
          willChange: 'transform, filter, opacity',
          ['--rgb' as string]: '14px',
          filter:
            'drop-shadow(var(--rgb) 0 0 #ff2d8c) drop-shadow(calc(var(--rgb) * -1) 0 0 #2dd4ff)',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority
          draggable={false}
          className="h-full w-full object-contain select-none"
        />
      </div>
    </div>
  );
}
