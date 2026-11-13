// SHT 06 — names are set expanded and condense to working width as they arrive;
// the typeface itself is under load. Ported from legacy main.js initSectors().
import { gsap } from 'gsap';
import type { MotionOptions } from './types';

export function initSectors(section: HTMLElement, { reduced }: MotionOptions) {
  if (reduced) return () => {};
  const ctx = gsap.context(() => {
    section.querySelectorAll<HTMLElement>('.sectors__list li').forEach(li => {
      const name = li.querySelector('.sectors__name');
      gsap.fromTo(name, { '--w': 125, opacity: .25 }, {
        '--w': 62, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: li, start: 'top 98%', end: 'top 62%', scrub: true },
      });
    });
  }, section);
  return () => ctx.revert();
}
