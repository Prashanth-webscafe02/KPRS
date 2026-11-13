// Navigation chrome: title-block sheet roll, section tone, at-top state,
// scale gauge and the drawing register. Ported from legacy main.js initChrome().
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis, scrollToTarget } from '@/lib/scrolling/lenis';
import type { MotionOptions } from './types';

export function initChrome({ reduced }: MotionOptions) {
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
  const num = $('[data-sheet-num]');
  const title = $('[data-sheet-title]');
  const needle = $('[data-gauge-needle]');
  const read = $('[data-gauge-read]');
  const gauge = $('.gauge');
  const reg = $('[data-register]');
  const openBtn = $('[data-index-open]');
  const closeBtn = $('[data-index-close]');
  const body = document.body;
  let gaugeH = gauge.clientHeight;
  const onResize = () => { gaugeH = gauge.clientHeight; };
  window.addEventListener('resize', onResize);
  let currentSheet = '01';
  let registerOpen = false;

  const ctx = gsap.context(() => {});

  const setSheet = (el: HTMLElement) => {
    body.dataset.tone = el.dataset.tone;
    if (el.dataset.sheet === currentSheet) return;
    currentSheet = el.dataset.sheet!;
    if (reduced) { num.textContent = currentSheet; title.textContent = el.dataset.sheetTitle!; return; }
    ctx.add(() => {
      gsap.timeline()
        .to([num, title], { yPercent: -60, opacity: 0, duration: .18, ease: 'power2.in' })
        .add(() => { num.textContent = currentSheet; title.textContent = el.dataset.sheetTitle!; })
        .fromTo([num, title], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power3.out', stagger: .04 });
    });
  };
  body.dataset.tone = 'dark';

  ctx.add(() => {
    document.querySelectorAll<HTMLElement>('[data-sheet]').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 30px', end: 'bottom 30px',
        onToggle: s => { if (s.isActive) setSheet(el); },
      });
    });

    // gauge (height is 42vh: cached, re-read only on resize, so scrolling
    // never forces a layout read after the other scroll-driven style writes)
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: s => {
        needle.style.transform = `translateY(${s.progress * gaugeH}px)`;
        read.textContent = String(Math.round(s.progress * 1000)).padStart(3, '0');
      },
    });
  });

  // nav is transparent only while the hero owns the screen
  const atTop = () => body.classList.toggle('at-top', window.scrollY < 80);
  window.addEventListener('scroll', atTop, { passive: true });
  atTop();

  // index / drawing register
  const closeRegister = () => {
    if (!registerOpen) return;
    registerOpen = false;
    reg.classList.remove('is-open'); reg.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    getLenis()?.start();
  };
  const onOpen = () => {
    if (registerOpen) return closeRegister();
    registerOpen = true;
    reg.classList.add('is-open'); reg.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    getLenis()?.stop();
    if (!reduced) ctx.add(() => {
      gsap.fromTo(reg.querySelectorAll('tbody tr'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: .05, duration: .6, delay: .35, ease: 'power3.out' });
    });
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRegister(); };
  openBtn.addEventListener('click', onOpen);
  closeBtn.addEventListener('click', closeRegister);
  window.addEventListener('keydown', onKey);

  // in-page anchors: close the register and glide to the sheet
  const onAnchor = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!;
    if (id.length < 2) return;
    e.preventDefault();
    closeRegister();
    scrollToTarget(id);
  };
  document.addEventListener('click', onAnchor);

  return () => {
    ctx.revert();
    window.removeEventListener('scroll', atTop);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKey);
    openBtn.removeEventListener('click', onOpen);
    closeBtn.removeEventListener('click', closeRegister);
    document.removeEventListener('click', onAnchor);
    closeRegister();
    reg.classList.remove('is-open'); reg.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    num.textContent = '01'; title.textContent = 'Reveal';
    needle.style.removeProperty('transform'); read.textContent = '000';
    body.classList.remove('at-top');
    delete body.dataset.tone;
  };
}
