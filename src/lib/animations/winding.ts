// SHT 02 — word scrub, coil clip-path and turn counter. Ported from legacy main.js initWinding().
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionOptions } from './types';

export function initWinding(section: HTMLElement, { reduced }: MotionOptions) {
  const statement = section.querySelector<HTMLElement>('[data-scrub-words]')!;
  const turns = section.querySelector<HTMLElement>('[data-turns]')!;
  const count = section.querySelector<HTMLElement>('[data-turn-count]')!;
  const TOTAL = 1184;
  if (reduced) {
    turns.style.clipPath = 'inset(0 0 0 0)'; count.textContent = String(TOTAL);
    return () => { turns.style.removeProperty('clip-path'); count.textContent = '0000'; };
  }
  const ctx = gsap.context(() => {
    gsap.to(statement.querySelectorAll('.w'), {
      opacity: 1, ease: 'none', stagger: .05,
      scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 42%', scrub: true },
    });
    ScrollTrigger.create({
      trigger: section, start: 'top 70%', end: 'bottom 85%', scrub: true,
      onUpdate: s => {
        const p = s.progress;
        turns.style.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
        count.textContent = String(Math.round(p * TOTAL)).padStart(4, '0');
      },
    });
  }, section);
  return () => {
    ctx.revert();
    turns.style.removeProperty('clip-path');
    count.textContent = '0000';
  };
}
