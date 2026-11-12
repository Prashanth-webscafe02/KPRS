import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initHero } from './hero.js';
import { initAnatomy } from './anatomy.js';
import { initRange } from './range.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ------------------------------------------------------- smooth scroll */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: .085, wheelMultiplier: .9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
}
const scrollTo = target => {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView();
};
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  e.preventDefault();
  closeRegister();
  scrollTo(id);
}));

/* ---------------------------------------------------------- scenes */
let hero;
try { hero = initHero({ reduced }); } catch (e) { console.error(e); document.documentElement.classList.remove('js'); }
initWinding();
try { initAnatomy({ reduced }); } catch (e) { console.error(e); }
initRange({ reduced });
initRecord();
initSectors();
initEnquire();
initChrome();

const go = () => hero && hero.start();
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go));
window.addEventListener('load', () => ScrollTrigger.refresh());

/* ------------------------------------------------------ SHT 02 winding */
function initWinding() {
  const statement = $('[data-scrub-words]');
  statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const turns = $('[data-turns]');
  const count = $('[data-turn-count]');
  const TOTAL = 1184;
  if (reduced) {
    turns.style.clipPath = 'inset(0 0 0 0)'; count.textContent = TOTAL;
    return;
  }
  gsap.to($$('.w', statement), {
    opacity: 1, ease: 'none', stagger: .05,
    scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 42%', scrub: true },
  });
  ScrollTrigger.create({
    trigger: '.winding', start: 'top 70%', end: 'bottom 85%', scrub: true,
    onUpdate: s => {
      const p = s.progress;
      turns.style.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
      count.textContent = String(Math.round(p * TOTAL)).padStart(4, '0');
    },
  });
}

/* -------------------------------------------------- SHT 05 test record */
function initRecord() {
  const rows = $$('.record__table tbody tr');
  const stamp = $('.record__stamp');
  if (reduced) return;
  gsap.set(rows, { opacity: 0 });
  gsap.set(stamp, { opacity: 0, scale: 1.9, rotate: -32 });
  const nums = $$('[data-count]');
  nums.forEach(n => { n.textContent = (0).toFixed(+n.dataset.dec); });

  ScrollTrigger.create({
    trigger: '.record__sheet', start: 'top 68%', once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      rows.forEach((r, i) => {
        // each row is "measured": appears, then its reading settles
        tl.to(r, { opacity: 1, duration: .25, ease: 'none' }, i * .16);
        const n = $('[data-count]', r);
        if (n) {
          const end = +n.dataset.count, dec = +n.dataset.dec, o = { v: 0 };
          tl.to(o, { v: end, duration: .9, ease: 'expo.out', onUpdate: () => { n.textContent = o.v.toFixed(dec); } }, i * .16 + .05);
        }
      });
      tl.to(stamp, { opacity: 1, scale: 1, rotate: -11, duration: .35, ease: 'power4.in' }, '+=.15')
        .to('.record__sheet', { x: 2, y: 2, duration: .05, yoyo: true, repeat: 1, ease: 'none' });
    },
  });
}

/* ------------------------------------------------------ SHT 06 sectors */
function initSectors() {
  if (reduced) return;
  // names are set expanded and condense to working width as they arrive —
  // the typeface itself is under load.
  $$('.sectors__list li').forEach(li => {
    const name = $('.sectors__name', li);
    gsap.fromTo(name, { '--w': 125, opacity: .25 }, {
      '--w': 62, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: li, start: 'top 98%', end: 'top 62%', scrub: true },
    });
  });
}

/* ------------------------------------------------------ SHT 07 enquire */
function initEnquire() {
  $('[data-year]').textContent = new Date().getFullYear();
  if (reduced) return;
  gsap.fromTo('.enquire__title > *', { yPercent: 100, clipPath: 'inset(0 0 100% 0)' }, {
    yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.4, stagger: .12, ease: 'expo.out',
    scrollTrigger: { trigger: '.enquire__title', start: 'top 82%', once: true },
  });
  gsap.fromTo('.titleblock', { clipPath: 'inset(0 100% 0 0)' }, {
    clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut',
    scrollTrigger: { trigger: '.titleblock', start: 'top 92%', once: true },
  });
}

/* --------------------------------------------- navigation + gauge + index */
let registerOpen = false;
function closeRegister() {
  if (!registerOpen) return;
  registerOpen = false;
  const reg = $('[data-register]');
  reg.classList.remove('is-open'); reg.setAttribute('aria-hidden', 'true');
  $('[data-index-open]').setAttribute('aria-expanded', 'false');
  lenis && lenis.start();
}

function initChrome() {
  const num = $('[data-sheet-num]');
  const title = $('[data-sheet-title]');
  let currentSheet = '01';

  const setSheet = el => {
    document.body.dataset.tone = el.dataset.tone;
    if (el.dataset.sheet === currentSheet) return;
    currentSheet = el.dataset.sheet;
    if (reduced) { num.textContent = currentSheet; title.textContent = el.dataset.sheetTitle; return; }
    gsap.timeline()
      .to([num, title], { yPercent: -60, opacity: 0, duration: .18, ease: 'power2.in' })
      .add(() => { num.textContent = currentSheet; title.textContent = el.dataset.sheetTitle; })
      .fromTo([num, title], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power3.out', stagger: .04 });
  };
  document.body.dataset.tone = 'dark';
  $$('[data-sheet]').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 30px', end: 'bottom 30px',
      onToggle: s => { if (s.isActive) setSheet(el); },
    });
  });

  // nav is transparent only while the hero owns the screen
  const atTop = () => document.body.classList.toggle('at-top', window.scrollY < 80);
  window.addEventListener('scroll', atTop, { passive: true });
  atTop();

  // gauge
  const needle = $('[data-gauge-needle]');
  const read = $('[data-gauge-read]');
  const gauge = $('.gauge');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: s => {
      needle.style.transform = `translateY(${s.progress * gauge.clientHeight}px)`;
      read.textContent = String(Math.round(s.progress * 1000)).padStart(3, '0');
    },
  });

  // index / drawing register
  const reg = $('[data-register]');
  const openBtn = $('[data-index-open]');
  openBtn.addEventListener('click', () => {
    if (registerOpen) return closeRegister();
    registerOpen = true;
    reg.classList.add('is-open'); reg.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    lenis && lenis.stop();
    if (!reduced) gsap.fromTo($$('tbody tr', reg), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: .05, duration: .6, delay: .35, ease: 'power3.out' });
  });
  $('[data-index-close]').addEventListener('click', closeRegister);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeRegister(); });
}
