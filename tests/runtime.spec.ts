// Runtime behaviour of the Next.js build: lifecycle safety, console hygiene,
// navigation chrome, keyboard access and reduced motion.
// Run against `npm run dev` (Strict Mode double-mount) and against `npm run start`.
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import { NEXT_URL, LEGACY_URL, layout, pump, scrollToY, wait } from './helpers';

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    const t = m.text();
    if (m.type() === 'error' || /hydrat|did not match/i.test(t)) problems.push(`[${m.type()}] ${t}`);
  });
  page.on('pageerror', e => problems.push(`[pageerror] ${e.message}`));
  return problems;
}

const dom = (page: Page) => page.evaluate(() => ({
  canvases: document.querySelectorAll('canvas').length,
  lost: [...document.querySelectorAll('canvas')].map(c => {
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    return gl ? gl.isContextLost() : null;
  }),
  heroLeaders: document.querySelectorAll('[data-hero-leaders] g').length,
  anatomyLeaders: document.querySelectorAll('[data-anatomy-leaders] g').length,
  floats: document.querySelectorAll('.anatomy__float').length,
  pinSpacers: document.querySelectorAll('.pin-spacer').length,
  activeSteps: document.querySelectorAll('[data-anatomy-steps] li.is-active').length,
}));

test.describe('desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('lifecycle: one canvas per scene, no duplicates, no console errors', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(4000);
    const d = await dom(page);
    expect(d.canvases).toBe(2);
    expect(d.lost).toEqual([false, false]);
    expect(d.heroLeaders).toBe(3);
    expect(d.anatomyLeaders).toBe(1);
    expect(d.floats).toBe(1);
    expect(d.pinSpacers).toBe(2);
    expect(d.activeSteps).toBe(1);
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('same structure as legacy', async ({ browser }) => {
    const snap = async (url: string) => {
      const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await p.goto(url, { waitUntil: 'load' });
      await wait(3000);
      const r = { ...(await dom(p)), L: await layout(p) };
      await p.close();
      return r;
    };
    const [a, b] = [await snap(LEGACY_URL), await snap(NEXT_URL)];
    expect(b.canvases).toBe(a.canvases);
    expect(b.pinSpacers).toBe(a.pinSpacers);
    // Page geometry matches the original down to the test record. Below it the
    // content stage (Phase G) intentionally differs: specimen banner, four verified
    // sectors instead of six. Full-page geometry parity was verified before Phase G
    // (see parity.spec.ts, run against the parity-state build).
    const upToRecord = ({ vh, vw, winding, anatomy, range, rangeDist, plates, record }: typeof a.L) =>
      ({ vh, vw, winding, anatomy, range, rangeDist, plates, record });
    expect(upToRecord(b.L)).toEqual(upToRecord(a.L));
  });

  // Software WebGL (SwiftShader) stalls the main thread while both scenes compile,
  // so let the intro finish before scripted scrolling, as the parity spec does.

  test('chrome: sheet roll, tone, gauge, at-top', async ({ page }) => {
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(8000);
    await expect(page.locator('body')).toHaveClass(/at-top/);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'dark');
    const L = await layout(page);
    await scrollToY(page, L.anatomy + 10, 2500);
    await expect(page.locator('[data-sheet-num]')).toHaveText('03');
    await expect(page.locator('.tb__title')).toHaveText('Anatomy');
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'paper');
    await expect(page.locator('body')).not.toHaveClass(/at-top/);
    await scrollToY(page, L.range + 10, 2500);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'graphite');
    await scrollToY(page, L.max, 2500);
    // Lenis lerps asymptotically, so the needle lands within a few thousandths of the end
    expect(Number(await page.locator('[data-gauge-read]').textContent())).toBeGreaterThanOrEqual(990);
    // Note: SHT 07 is never reached at this viewport, in the original too: the footer's
    // 'top 30px' start sits ~120px below the max scroll position. Pre-existing; not changed.
    await expect(page.locator('[data-sheet-num]')).toHaveText('06');
  });

  test('motion: coil, turn counter, record stamp', async ({ page }) => {
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(8000);
    const L = await layout(page);
    // coil trigger runs from section top at 70% to section bottom at 85%; this is ~46% through
    await scrollToY(page, L.winding - L.vh * .2, 3000);
    await expect.poll(async () => Number(await page.locator('[data-turn-count]').textContent()), { timeout: 15_000 }).toBeGreaterThan(0);
    expect(Number(await page.locator('[data-turn-count]').textContent())).toBeLessThan(1184);
    await scrollToY(page, L.record - L.vh * .3, 4500);
    await expect(page.locator('[data-count="91.42"]')).toHaveText('91.42', { timeout: 15_000 });
    await expect.poll(() => page.locator('.record__stamp').evaluate(e => Number(getComputedStyle(e).opacity)), { timeout: 15_000 }).toBe(1);
    const stamp = await page.locator('.record__stamp').evaluate(e => getComputedStyle(e).opacity);
    expect(Number(stamp)).toBe(1);
  });

  test('keyboard: register opens, Escape closes, links navigate', async ({ page }) => {
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(1000);
    const btn = page.locator('[data-index-open]');
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#register')).toHaveClass(/is-open/);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#register')).not.toHaveClass(/is-open/);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await page.locator('#register a[href="#record"]').click();
    await expect(page.locator('#register')).not.toHaveClass(/is-open/);
    await pump(page, 3000);
    await expect(page.locator('[data-sheet-num]')).toHaveText('05');
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('final states are shown without animation', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(1500);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    const title = await page.locator('.hero__title .line > span').first().evaluate(e => getComputedStyle(e).transform);
    expect(title).toBe('none');
    await expect(page.locator('[data-turn-count]')).toHaveText('1184');
    await expect(page.locator('[data-count="91.42"]')).toHaveText('91.42');
    expect((await dom(page)).canvases).toBe(2);
    expect(problems, problems.join('\n')).toEqual([]);
  });
});

test.describe('mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('no horizontal overflow, no range pin, no errors', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(2500);
    const d = await dom(page);
    expect(d.canvases).toBe(2);
    expect(d.pinSpacers).toBe(1); // anatomy only; range is a vertical stack below 861px
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(problems, problems.join('\n')).toEqual([]);
  });
});
