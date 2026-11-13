import type { Page } from '@playwright/test';

export const LEGACY_URL = process.env.LEGACY_URL ?? 'http://127.0.0.1:5174/';
export const NEXT_URL = process.env.NEXT_URL ?? 'http://127.0.0.1:3100/';

export const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'large-1920', width: 1920, height: 1080 },
];

export const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Headless Chromium may not produce frames (so rAF, the GSAP ticker and Lenis
 *  stall) unless something forces one. A 1×1 capture forces a frame. */
export async function pump(page: Page, ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    await page.screenshot({ clip: { x: 0, y: 0, width: 1, height: 1 } });
    await wait(50);
  }
}

/** Jump to an absolute scroll position and let scrub / lerp settle. */
export async function scrollToY(page: Page, y: number, settle = 1800) {
  await page.evaluate(v => window.scrollTo(0, v), Math.round(y));
  await pump(page, settle);
}

/** Scroll positions derived from the live DOM (pin spacers included). */
export async function layout(page: Page) {
  return page.evaluate(() => {
    const top = (s: string) => {
      const el = document.querySelector(s) as HTMLElement;
      return el.getBoundingClientRect().top + window.scrollY;
    };
    const track = document.querySelector('[data-range-track]') as HTMLElement;
    return {
      vh: window.innerHeight,
      vw: window.innerWidth,
      winding: top('#winding'),
      anatomy: top('#anatomy'),
      range: top('#range'),
      rangeDist: track.scrollWidth - window.innerWidth,
      plates: [...document.querySelectorAll('.plate')].map(p => (p as HTMLElement).getBoundingClientRect().top + window.scrollY),
      record: top('.record__sheet'),
      sectors: top('#sectors'),
      footer: top('#enquire'),
      max: document.documentElement.scrollHeight - window.innerHeight,
    };
  });
}

/** Fraction of pixels whose max channel delta exceeds `threshold` (computed in-browser). */
export async function diffRatio(page: Page, a: Buffer, b: Buffer, threshold = 32) {
  return page.evaluate(async ([a64, b64, t]) => {
    const load = (s: string) => new Promise<HTMLImageElement>(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
    const [ia, ib] = await Promise.all([load(a64 as string), load(b64 as string)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const read = (img: HTMLImageElement) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d')!; x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const da = read(ia), db = read(ib);
    let bad = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])) > (t as number)) bad++;
    }
    return bad / (w * h);
  }, [a.toString('base64'), b.toString('base64'), threshold] as const);
}
