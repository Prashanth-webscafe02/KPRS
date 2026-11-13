'use client';

// Inner-page motion: one GSAP context per page, reverted on route change.
// Elements opt in with data-reveal:
//   (empty)  fade and rise
//   lines    each .ln > span rises out of its mask (headlines)
//   image    the picture is uncovered from below and settles from a slight zoom
//   stagger  direct children arrive one after another
// data-parallax="n" drifts an element by n % of its height across the viewport.
// Also sets the section tone the header reads (see lib/animations/tone.ts).
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initTone } from '@/lib/animations/tone';

export default function PageMotion() {
  const path = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const main = document.querySelector('main');
    if (!main) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const untone = initTone(main);
    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', main);

    const ctx = gsap.context(() => {
      if (reduced) { gsap.set(items, { opacity: 1 }); return; }
      items.forEach(el => {
        const st = { trigger: el, start: 'top 88%', once: true };
        gsap.set(el, { opacity: 1 });
        switch (el.dataset.reveal) {
          case 'lines':
            gsap.fromTo(el.querySelectorAll('.ln > span'), { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.2, stagger: .09, ease: 'expo.out', scrollTrigger: st });
            break;
          case 'image': {
            const img = el.querySelector('img');
            gsap.fromTo(el, { clipPath: 'inset(18% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', scrollTrigger: st });
            if (img) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: st });
            break;
          }
          case 'stagger':
            gsap.fromTo(el.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, stagger: .07, ease: 'power3.out', scrollTrigger: st });
            break;
          default:
            gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: st });
        }
      });
      gsap.utils.toArray<HTMLElement>('[data-parallax]', main).forEach(el => {
        const n = +(el.dataset.parallax || 8);
        gsap.fromTo(el, { yPercent: -n }, { yPercent: n, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, main);

    // images that finish loading can move triggers further down the page
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
      ctx.revert();
      untone();
    };
  }, [path]);

  return null;
}
