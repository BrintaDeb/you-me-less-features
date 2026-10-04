import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseSmoothScrollOptions {
  enabled?: boolean;
  isPaused?: boolean;
}

export interface SmoothScrollOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}

/**
 * Universal smooth scrolling utility.
 * Delegates to Lenis when available (desktop fine pointer), or native smooth scroll when on touch devices or reduced motion.
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  options?: SmoothScrollOptions
): void {
  if (typeof window === 'undefined') return;

  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;

  if (lenis && !lenis.isStopped) {
    if (typeof target === 'number') {
      lenis.scrollTo(target, {
        duration: options?.immediate ? 0 : (options?.duration ?? 1.15),
        offset: options?.offset ?? 0,
        immediate: options?.immediate,
      });
      return;
    }

    if (typeof target === 'string') {
      const el = target.startsWith('#')
        ? document.querySelector(target)
        : document.getElementById(target) || document.querySelector(target);
      if (el) {
        lenis.scrollTo(el as HTMLElement, {
          duration: options?.immediate ? 0 : (options?.duration ?? 1.15),
          offset: options?.offset ?? -80,
          immediate: options?.immediate,
        });
      }
      return;
    }

    if (target instanceof HTMLElement) {
      lenis.scrollTo(target, {
        duration: options?.immediate ? 0 : (options?.duration ?? 1.15),
        offset: options?.offset ?? -80,
        immediate: options?.immediate,
      });
      return;
    }
  }

  // Fallback for touchscreens / reduced motion / disabled Lenis (native browser scroll)
  const behavior: ScrollBehavior = options?.immediate ? 'auto' : 'smooth';

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else if (typeof target === 'string') {
    const el = target.startsWith('#')
      ? document.querySelector(target)
      : document.getElementById(target) || document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior, block: 'start' });
    }
  } else if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

export function useSmoothScroll({ enabled = true, isPaused = false }: UseSmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // If smooth scrolling is disabled for this route/view, ensure any prior Lenis instance is fully torn down
    if (!enabled) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
      return;
    }

    // Only enable Lenis momentum scroll on devices with fine pointer (mouse/trackpad), not touchscreens
    const hasFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false, // Keep native touch momentum on touchscreens
      autoResize: true,
    });

    lenisRef.current = lenis;

    // Attach to global window for external triggers
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Dynamic content ResizeObserver to update Lenis limits on layout shifts/image loads
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      resizeObserver.observe(document.body);
      if (document.documentElement) {
        resizeObserver.observe(document.documentElement);
      }
    }

    // Global in-page anchor link handler (smooth gliding without layout conflicts)
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl as HTMLElement, { offset: -80, duration: 1.15 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };
  }, [enabled]);

  // Handle modal pausing/resuming
  useEffect(() => {
    if (!lenisRef.current || !enabled) return;

    if (isPaused) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [enabled, isPaused]);

  return lenisRef;
}
