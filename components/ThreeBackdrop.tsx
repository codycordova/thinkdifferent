'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export default function ThreeBackdrop() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Disable WebGL backdrop on small screens for perf.
    if (window.matchMedia?.('(max-width: 639px)')?.matches) return;

    // Respect reduced motion + keep mobile perf safe.
    if (prefersReducedMotion()) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    host.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.9,
      emissive: new THREE.Color(0x0b0b0b),
      emissiveIntensity: 0.6,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2.5, 2.2, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.65);
    rimLight.position.set(-3.5, -1.5, 2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      mesh.rotation.x = t * 0.18;
      mesh.rotation.y = t * 0.24;
      mesh.position.y = Math.sin(t * 0.55) * 0.14;
      renderer.render(scene, camera);
      rafRef.current = window.requestAnimationFrame(animate);
    };
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden sm:block"
    >
      {/* gradient mesh layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,17,17,0.10),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(17,17,17,0.08),transparent_52%),radial-gradient(circle_at_50%_80%,rgba(17,17,17,0.06),transparent_58%)]" />
      {/* three canvas host */}
      <div ref={hostRef} className="absolute inset-0 opacity-[0.22]" />
      {/* grain */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply [background-image:radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:3px_3px]" />
    </div>
  );
}

