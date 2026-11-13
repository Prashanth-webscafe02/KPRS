// Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger and Lenis
// share one clock. Ported from legacy-vite/src/main.js (same lerp / multiplier).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis: Lenis | null = null;

export const getLenis = () => lenis;

/** Creates the singleton. Returns a cleanup that destroys it and unhooks the ticker. */
export function initLenis(): () => void {
  const instance = new Lenis({ lerp: .085, wheelMultiplier: .9 });
  lenis = instance;
  instance.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => instance.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const onRefresh = () => instance.resize();
  ScrollTrigger.addEventListener('refresh', onRefresh);

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    gsap.ticker.remove(tick);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

export function scrollToTarget(target: string | Element) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView();
}
