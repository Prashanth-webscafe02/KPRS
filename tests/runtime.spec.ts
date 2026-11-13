// Runtime behaviour of the Next.js build: lifecycle safety, console hygiene,
// navigation chrome, keyboard access and reduced motion.
// Run against `npm run dev` (Strict Mode double-mount) and against `npm run start`.
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import { NEXT_URL, LEGACY_URL, layout, scrollToY, wait } from './helpers';

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

  test('chrome: header tone, scrolled state, gauge', async ({ page }) => {
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(8000);
    await expect(page.locator('.hdr')).not.toHaveAttribute('data-scrolled', /.*/);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'dark');
    const L = await layout(page);
    await scrollToY(page, L.anatomy + 10, 2500);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'paper');
    await expect(page.locator('.hdr')).toHaveAttribute('data-scrolled', /.*/);
    await scrollToY(page, L.range + 10, 2500);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'graphite');
    await scrollToY(page, L.max, 2500);
    // Lenis lerps asymptotically, so the needle lands within a few thousandths of the end
    expect(Number(await page.locator('[data-gauge-read]').textContent())).toBeGreaterThanOrEqual(990);
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

  test('keyboard: products menu opens, Escape closes, links route', async ({ page }) => {
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(1000);
    const caret = page.locator('.hdr__caret');
    await caret.focus();
    await page.keyboard.press('Enter');
    await expect(caret).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#hdr-products')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(caret).toHaveAttribute('aria-expanded', 'false');
    await expect(caret).toBeFocused();
    await caret.click();
    await page.locator('#hdr-products a[href="/products/dry-type-transformers"]').click();
    // generous: under SwiftShader the main thread stalls while both scenes compile
    await expect(page).toHaveURL(/\/products\/dry-type-transformers$/, { timeout: 60_000 });
    await expect(page.locator('h1')).toHaveText('Dry-type transformers');
    await expect(page.locator('.hdr__drop > a')).toHaveAttribute('data-active', /.*/);
  });

  test('routes: leaving and returning home rebuilds both scenes cleanly', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto(NEXT_URL, { waitUntil: 'load' });
    await wait(4000);
    expect((await dom(page)).canvases).toBe(2);
    await page.locator('.hdr__nav a[href="/manufacturing"]').click();
    await expect(page.locator('h1')).toContainText('From core steel');
    expect(await page.locator('canvas').count()).toBe(0);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.goBack();
    await wait(4000);
    expect((await dom(page)).canvases).toBe(2);
    expect(problems, problems.join('\n')).toEqual([]);
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('menu: opens, traps focus, locks scroll, Escape closes; no sideways scroll', async ({ page }) => {
    await page.goto(NEXT_URL + 'about', { waitUntil: 'load' });
    await wait(1000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const burger = page.locator('.hdr__burger');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/menu-open/);
    await expect(page.locator('#mobile-menu a').first()).toBeFocused();
    await page.locator('#mobile-menu .mnav__row button').click();
    await expect(page.locator('#mnav-products')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/menu-open/);
    await expect(burger).toBeFocused();
    await burger.click();
    await page.locator('#mobile-menu a[href="/quality"]').click();
    await expect(page).toHaveURL(/\/quality$/);
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('contact form: validates, and says plainly that the demo sends nothing', async ({ page }) => {
    await page.goto(NEXT_URL + 'contact?product=power-transformers', { waitUntil: 'load' });
    await expect(page.locator('#f-product')).toHaveValue('power-transformers');
    await page.locator('.fm button[type=submit]').click();
    await expect(page.locator('#f-name')).toBeFocused();
    await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    await page.fill('#f-name', 'Test Engineer');
    await page.fill('#f-email', 'not-an-email');
    await page.fill('#f-message', 'A 10 MVA 66/11 kV unit, ONAN, outdoor.');
    await page.locator('.fm button[type=submit]').click();
    await expect(page.locator('#f-email-err')).toBeVisible();
    await page.fill('#f-email', 'test@example.com');
    await page.locator('.fm button[type=submit]').click();
    await expect(page.locator('.fm-done')).toContainText('has not been sent');
    await expect(page.locator('.fm-done a[href^="mailto:"]')).toBeVisible();
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
