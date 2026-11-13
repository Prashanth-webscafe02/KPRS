// Screenshots of the content-corrected sections (Phase G) for manual review.
import { test } from '@playwright/test';
import fs from 'node:fs';
import { NEXT_URL, layout, scrollToY, pump } from './helpers';

for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
  test(`content ${vp.w}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await pump(page, 7000);
    fs.mkdirSync('parity-results/content', { recursive: true });
    await page.screenshot({ path: `parity-results/content/${vp.w}-hero.png` });
    const L = await layout(page);
    if (vp.w > 860) {
      await scrollToY(page, L.range + L.rangeDist * .78, 3000);
      await page.screenshot({ path: `parity-results/content/${vp.w}-plate5.png` });
    } else {
      await scrollToY(page, L.plates[4] - L.vh * .1, 4000);
      await page.screenshot({ path: `parity-results/content/${vp.w}-plate5.png` });
    }
    await scrollToY(page, L.record - L.vh * .3, 5000);
    await page.screenshot({ path: `parity-results/content/${vp.w}-record.png` });
    await scrollToY(page, L.max, 3000);
    await page.screenshot({ path: `parity-results/content/${vp.w}-footer.png` });
  });
}
