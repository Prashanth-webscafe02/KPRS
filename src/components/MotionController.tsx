'use client';

// Client-only orchestration of every scroll, GSAP and WebGL behaviour.
//
// Everything is initialised from ONE effect, in exactly the order the original
// main.js used (Lenis → hero → winding → anatomy pin → range pin → record →
// sectors → enquire → chrome). Pinned ScrollTriggers must be created top-to-bottom
// so each later trigger measures the spacer of the pins above it.
//
// Each init returns a cleanup; cleanups run in reverse, so a Strict Mode
// remount (or HMR) tears down tweens, triggers, pin spacers, listeners, rAF
// loops and WebGL contexts before re-creating them. Canvases are created
// per mount because a disposed renderer forces context loss on its canvas.
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createHeroScene } from '@/three/heroScene';
import { createAnatomyScene } from '@/three/anatomyScene';
import { initLenis } from '@/lib/scrolling/lenis';
import { initWinding } from '@/lib/animations/winding';
import { initRange } from '@/lib/animations/range';
import { initRecord } from '@/lib/animations/record';
import { initSectors } from '@/lib/animations/sectors';
import { initEnquire } from '@/lib/animations/enquire';
import { initChrome } from '@/lib/animations/chrome';
import type { Cleanup } from '@/lib/animations/types';

function makeCanvas(className: string, dataAttr: string) {
  const c = document.createElement('canvas');
  c.className = className;
  c.setAttribute(dataAttr, '');
  c.setAttribute('aria-hidden', 'true');
  return c;
}

export default function MotionController() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const opts = { reduced };
    const cleanups: Cleanup[] = [];
    let cancelled = false;
    const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;

    /* smooth scroll */
    if (!reduced) cleanups.push(initLenis());

    /* SHT 01 hero */
    let hero: ReturnType<typeof createHeroScene> | null = null;
    {
      const section = q('.hero');
      const canvas = makeCanvas('hero__canvas', 'data-hero-canvas');
      section.prepend(canvas);
      try {
        const h = createHeroScene({ section, canvas, leaders: q<SVGSVGElement>('[data-hero-leaders]'), reduced });
        hero = h;
        cleanups.push(() => { h.dispose(); canvas.remove(); });
      } catch (e) {
        console.error(e);
        canvas.remove();
        document.documentElement.classList.remove('js');
      }
    }

    /* SHT 02 winding */
    cleanups.push(initWinding(q('.winding'), opts));

    /* SHT 03 anatomy */
    let anatomyWarm: Promise<void> = Promise.resolve();
    {
      const pin = q('[data-anatomy-pin]');
      const canvas = makeCanvas('anatomy__canvas', 'data-anatomy-canvas');
      q('.anatomy__grid').after(canvas);
      try {
        const a = createAnatomyScene({ pin, canvas, leaders: q<SVGSVGElement>('[data-anatomy-leaders]'), reduced });
        anatomyWarm = a.warm;
        cleanups.push(() => { a.dispose(); canvas.remove(); });
      } catch (e) {
        console.error(e);
        canvas.remove();
      }
    }

    /* SHT 04–07 */
    cleanups.push(initRange(q('.range'), opts));
    cleanups.push(initRecord(q('.record'), opts));
    cleanups.push(initSectors(q('.sectors'), opts));
    cleanups.push(initEnquire(q('.enquire'), opts));
    cleanups.push(initChrome(opts));

    /* start the reveal once type has loaded and the anatomy scene has finished
       its one-off shader warm-up, so no compile stall can land mid-intro */
    let raf = 0;
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), anatomyWarm]).then(() => {
      if (cancelled) return;
      raf = requestAnimationFrame(() => hero?.start());
    });

    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') ScrollTrigger.refresh();
    else window.addEventListener('load', onLoad);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
      for (let i = cleanups.length - 1; i >= 0; i--) {
        try { cleanups[i](); } catch (e) { console.error(e); }
      }
    };
  }, []);

  return null;
}
