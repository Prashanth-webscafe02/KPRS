// SHT 04 — Immersive product exhibition.
// A horizontal gallery of drawing plates. Each elevation is "plotted" stroke
// by stroke as it travels into the light; names are unmasked, not faded.
// Ported from legacy-vite/src/range.js — breakpoints, scroll ranges and staggers unchanged.
// The drawings themselves are rendered in JSX (ProductExhibition), not injected here.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionOptions } from './types';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export function initRange(section: HTMLElement, { reduced }: MotionOptions) {
  if (reduced) return () => {};

  const pin = section.querySelector<HTMLElement>('[data-range-pin]')!;
  const track = section.querySelector<HTMLElement>('[data-range-track]')!;
  const plates = [...section.querySelectorAll<HTMLElement>('.plate')];
  const railNum = section.querySelector<HTMLElement>('[data-plate-num]')!;
  const railBar = section.querySelector<HTMLElement>('[data-range-progress]')!;

  const strokes = (plate: HTMLElement) => plate.querySelectorAll('.ln, .ln-thin, .ln-dim');
  const quiet = (plate: HTMLElement) => plate.querySelectorAll('text, .ln-cl');

  const mm = gsap.matchMedia();

  mm.add('(min-width: 861px)', () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    const slide = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: .6,
        invalidateOnRefresh: true,
        onUpdate: s => {
          railBar.style.transform = `scaleX(${s.progress})`;
        },
      },
    });

    plates.forEach((plate, i) => {
      const st = { containerAnimation: slide, trigger: plate };
      gsap.fromTo(strokes(plate), { strokeDasharray: 1, strokeDashoffset: 1 }, {
        strokeDashoffset: 0, ease: 'none', stagger: { each: .004, from: 'end' },
        scrollTrigger: { ...st, start: 'left 92%', end: 'left 22%', scrub: true },
      });
      gsap.fromTo(quiet(plate), { opacity: 0 }, {
        opacity: 1, ease: 'none',
        scrollTrigger: { ...st, start: 'left 50%', end: 'left 25%', scrub: true },
      });
      gsap.fromTo(plate.querySelector('.plate__name'), { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', ease: 'none',
        scrollTrigger: { ...st, start: 'left 60%', end: 'left 20%', scrub: true },
      });
      gsap.fromTo(plate.querySelectorAll('.plate__body > p, .spec tr'), { opacity: 0, x: 30 }, {
        opacity: 1, x: 0, stagger: .1, ease: 'none',
        scrollTrigger: { ...st, start: 'left 45%', end: 'left 12%', scrub: true },
      });
      // numerals drift slower than the plate: depth without 3D
      gsap.fromTo(plate.querySelector('.plate__num'), { x: -50 }, {
        x: 50, ease: 'none',
        scrollTrigger: { ...st, start: 'left right', end: 'right left', scrub: true },
      });
      ScrollTrigger.create({
        ...st, start: 'left 55%', end: 'right 55%',
        onToggle: s => { if (s.isActive) railNum.textContent = ROMAN[i]; },
        onLeaveBack: () => { if (i === 0) railNum.textContent = '—'; },
      });
    });

    return () => {
      railBar.style.removeProperty('transform');
      railNum.textContent = '—';
    };
  });

  // Phones: the plates become a swipeable, snapping row (CSS scroll-snap on the
  // track). Each drawing plots itself the first time its plate is swiped into
  // view; the rail shows which plate is in front and how far through the range.
  mm.add('(max-width: 860px)', () => {
    const tls = plates.map(plate => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(strokes(plate), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: { each: .006, from: 'end' } })
        .fromTo(quiet(plate), { opacity: 0 }, { opacity: 1, duration: .6 }, 1.4)
        .fromTo(plate.querySelector('.plate__name'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'expo.inOut' }, .3);
      return tl;
    });
    // play a plate once it is well inside the track AND the track is on screen
    const seen = new Set<number>();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const i = plates.indexOf(e.target as HTMLElement);
        if (e.isIntersecting && !seen.has(i)) { seen.add(i); tls[i].play(); }
      });
    }, { root: track, threshold: .5 });
    const vio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) plates.forEach(p => io.observe(p)); else io.disconnect();
    }, { threshold: .35 });
    vio.observe(track);

    // rail: cached geometry, updated on resize; scroll handler only writes
    let max = 1, step = 1;
    const measure = () => {
      max = Math.max(1, track.scrollWidth - track.clientWidth);
      step = plates[0]?.offsetWidth || 1;
    };
    measure();
    const onScroll = () => {
      const x = track.scrollLeft;
      railBar.style.transform = `scaleX(${Math.min(1, x / max)})`;
      const i = Math.round((x - (plates[0]?.offsetLeft ?? 0) + step * .5) / step);
      railNum.textContent = i < 0 ? '—' : ROMAN[Math.min(plates.length - 1, i)];
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    onScroll();

    return () => {
      io.disconnect(); vio.disconnect();
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      tls.forEach(t => t.kill());
      railBar.style.removeProperty('transform');
      railNum.textContent = '—';
    };
  });

  return () => mm.revert();
}
