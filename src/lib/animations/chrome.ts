// Homepage chrome: section tone for the header, the right-edge scroll gauge and
// smooth in-page anchors. (The original title-block sheet roll and drawing
// register were replaced by the site header.)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToTarget } from '@/lib/scrolling/lenis';
import { initTone } from './tone';

export function initChrome() {
  const needle = document.querySelector<HTMLElement>('[data-gauge-needle]');
  const read = document.querySelector<HTMLElement>('[data-gauge-read]');
  const gauge = document.querySelector<HTMLElement>('.gauge');
  // gauge height is 42vh: cached and re-read only on resize, so scrolling never
  // forces a layout read after the other scroll-driven style writes
  let gaugeH = gauge?.clientHeight ?? 0;
  const onResize = () => { gaugeH = gauge?.clientHeight ?? 0; };
  window.addEventListener('resize', onResize);

  const untone = initTone(document.querySelector('main') ?? document);

  const ctx = gsap.context(() => {
    if (needle && read) ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: s => {
        needle.style.transform = `translateY(${s.progress * gaugeH}px)`;
        read.textContent = String(Math.round(s.progress * 1000)).padStart(3, '0');
      },
    });
  });

  // in-page anchors glide to the section
  const onAnchor = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!;
    if (id.length < 2 || !document.querySelector(id)) return;
    e.preventDefault();
    scrollToTarget(id);
  };
  document.addEventListener('click', onAnchor);

  return () => {
    ctx.revert();
    untone();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('click', onAnchor);
    needle?.style.removeProperty('transform');
    if (read) read.textContent = '000';
  };
}
