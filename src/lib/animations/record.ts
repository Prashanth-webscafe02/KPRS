// SHT 05 — rows "measured" one by one, readings settle, QA stamp slams, sheet nudges.
// Ported from legacy main.js initRecord().
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionOptions } from './types';

export function initRecord(section: HTMLElement, { reduced }: MotionOptions) {
  if (reduced) return () => {};
  const rows = [...section.querySelectorAll<HTMLElement>('.record__table tbody tr')];
  const stamp = section.querySelector<HTMLElement>('.record__stamp')!;
  const nums = [...section.querySelectorAll<HTMLElement>('[data-count]')];
  const finals = nums.map(n => n.textContent);

  const ctx = gsap.context(() => {
    gsap.set(rows, { opacity: 0 });
    gsap.set(stamp, { opacity: 0, scale: 1.9, rotate: -32 });
    nums.forEach(n => { n.textContent = (0).toFixed(+n.dataset.dec!); });

    ScrollTrigger.create({
      trigger: '.record__sheet', start: 'top 68%', once: true,
      onEnter: () => {
        ctx.add(() => {
          const tl = gsap.timeline();
          rows.forEach((r, i) => {
            // each row is "measured": appears, then its reading settles
            tl.to(r, { opacity: 1, duration: .25, ease: 'none' }, i * .16);
            const n = r.querySelector<HTMLElement>('[data-count]');
            if (n) {
              const end = +n.dataset.count!, dec = +n.dataset.dec!, o = { v: 0 };
              tl.to(o, { v: end, duration: .9, ease: 'expo.out', onUpdate: () => { n.textContent = o.v.toFixed(dec); } }, i * .16 + .05);
            }
          });
          tl.to(stamp, { opacity: 1, scale: 1, rotate: -11, duration: .35, ease: 'power4.in' }, '+=.15')
            .to('.record__sheet', { x: 2, y: 2, duration: .05, yoyo: true, repeat: 1, ease: 'none' });
        });
      },
    });
  }, section);

  return () => {
    ctx.revert();
    nums.forEach((n, i) => { n.textContent = finals[i]; });
  };
}
