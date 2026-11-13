// SHT 07 — title clip reveal and title-block wipe. Ported from legacy main.js initEnquire().
import { gsap } from 'gsap';
import type { MotionOptions } from './types';

export function initEnquire(footer: HTMLElement, { reduced }: MotionOptions) {
  const year = footer.querySelector<HTMLElement>('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
  if (reduced) return () => {};
  const ctx = gsap.context(() => {
    gsap.fromTo('.enquire__title > *', { yPercent: 100, clipPath: 'inset(0 0 100% 0)' }, {
      yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.4, stagger: .12, ease: 'expo.out',
      scrollTrigger: { trigger: '.enquire__title', start: 'top 82%', once: true },
    });
    gsap.fromTo('.titleblock', { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.titleblock', start: 'top 92%', once: true },
    });
  }, footer);
  return () => ctx.revert();
}
