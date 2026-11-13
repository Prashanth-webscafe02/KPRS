// 07 — title clip reveal. Ported from legacy main.js initEnquire().
import { gsap } from 'gsap';
import type { MotionOptions } from './types';

export function initEnquire(section: HTMLElement, { reduced }: MotionOptions) {
  if (reduced) return () => {};
  const ctx = gsap.context(() => {
    gsap.fromTo('.enquire__title > *', { yPercent: 100, clipPath: 'inset(0 0 100% 0)' }, {
      yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.4, stagger: .12, ease: 'expo.out',
      scrollTrigger: { trigger: '.enquire__title', start: 'top 82%', once: true },
    });
  }, section);
  return () => ctx.revert();
}
