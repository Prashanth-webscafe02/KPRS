// Visual parity: the legacy Vite build vs the Next.js build, same viewport, same scroll states.
// Screenshots + per-state pixel-diff ratios go to parity-results/<viewport>/ (gitignored;
// kept outside test-results/, which Playwright empties on every run).
import { test, chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LEGACY_URL, NEXT_URL, VIEWPORTS, diffRatio, layout, scrollToY, wait } from './helpers';

type State = { name: string; y: (L: Awaited<ReturnType<typeof layout>>) => number; settle?: number };

function states(mobile: boolean): State[] {
  const s: State[] = [
    { name: '01-hero', y: () => 0, settle: 0 },
    { name: '02-winding', y: L => L.winding + L.vh * .5 },
    ...[.02, .3, .5, .75, .98].map((p, i) => ({ name: `03-anatomy-${i + 1}`, y: (L: Awaited<ReturnType<typeof layout>>) => L.anatomy + p * 5 * L.vh, settle: 3000 })),
  ];
  if (mobile) {
    for (let i = 0; i < 5; i++) s.push({ name: `04-plate-${i + 1}`, y: L => L.plates[i] - L.vh * .15, settle: 3800 });
  } else {
    [0, .2, .4, .6, .8, 1].forEach((f, i) => s.push({ name: `04-range-${i}`, y: L => L.range + f * L.rangeDist, settle: 2500 }));
  }
  s.push(
    { name: '05-record', y: L => L.record - L.vh * .3, settle: 4500 },
    { name: '06-sectors', y: L => L.sectors + L.vh * .3 },
    { name: '07-footer', y: L => L.max, settle: 2500 },
  );
  return s;
}

for (const vp of VIEWPORTS) {
  test(`parity ${vp.name}`, async () => {
    const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const open = async (url: string) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: 'load' });
      return page;
    };
    const [legacy, next] = await Promise.all([open(LEGACY_URL), open(NEXT_URL)]);
    // let the cinematic intro (≈6 s) finish on both
    await wait(8000);

    const dir = path.join('parity-results', vp.name);
    fs.mkdirSync(dir, { recursive: true });
    const L = { legacy: await layout(legacy), next: await layout(next) };
    const report: Record<string, unknown> = { layout: L, states: {} as Record<string, number> };

    for (const st of states(vp.width < 861)) {
      const shot = async (page: Page, l: typeof L.legacy) => {
        await scrollToY(page, st.y(l), st.settle ?? 1800);
        return page.screenshot();
      };
      const [a, b] = await Promise.all([shot(legacy, L.legacy), shot(next, L.next)]);
      fs.writeFileSync(path.join(dir, `${st.name}-legacy.png`), a);
      fs.writeFileSync(path.join(dir, `${st.name}-next.png`), b);
      (report.states as Record<string, number>)[st.name] = +(await diffRatio(next, a, b)).toFixed(4);
    }
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(vp.name, JSON.stringify(report.states));
    await browser.close();
  });
}
