# KPRS — Next.js migration: progress report

**Updated:** 2026-11-13 (session 2 + cleanup). See **§10** and **§11** at the end for current state.
**Location:** moved from the repo root to `docs/` during cleanup (§11).
**Status:** Phases A–H done and verified in a browser. **Nothing committed yet** (awaiting approval). Open client questions in §10.4.
(§1–§9 below are the original session-1 handoff, kept for history.)

---

## 1. Git state (recorded at pause; nothing committed, discarded or pushed)

| Item | Value |
|---|---|
| Current branch | `next-migration` |
| Other branches | `master` (holds the baseline commit) |
| Baseline commit | `6ae2d1f` "Baseline: working Vite + Three.js + GSAP implementation" |
| Baseline tag | `vite-baseline` → `6ae2d1f` |
| Remote | none configured, nothing pushed |
| Deploy | none |

`git status --short` at pause:

```
 M .gitignore                 (added: .next/, next-env.d.ts, test-results/, playwright-report/, *.tsbuildinfo, legacy-dist/)
R  index.html -> legacy-vite/index.html          (staged rename, content unchanged)
R  src/anatomy.js -> legacy-vite/src/anatomy.js  (staged rename, content unchanged)
R  src/drawings.js -> legacy-vite/src/drawings.js
R  src/hero.js -> legacy-vite/src/hero.js
R  src/main.js -> legacy-vite/src/main.js
R  src/range.js -> legacy-vite/src/range.js
R  src/stage.js -> legacy-vite/src/stage.js
R  src/styles.css -> legacy-vite/src/styles.css
R  src/transformer.js -> legacy-vite/src/transformer.js
 M package-lock.json          (Next/React/TS/ESLint/Playwright installed)
 M package.json               (new scripts + deps; "type": "module" removed)
?? eslint.config.mjs
?? next.config.ts
?? src/                       (new Next.js source, partial: src/three/* only)
?? tsconfig.json
```

The `KPRS_MIGRATION_PROGRESS.md` file (this report) is also untracked.

## 2. Is the original Vite implementation recoverable? Yes, verified three ways

1. **Git tag `vite-baseline`** contains the complete original (index.html, src/*.js, styles.css, package.json, lockfile). Restore it somewhere safe with `git worktree add ../KPRS-vite vite-baseline`. That doesn't touch the current work.
2. **`legacy-vite/`** in the working tree: each of the 9 files was hash-compared against `vite-baseline` and is **byte-identical**.
3. **The legacy build still works:** `npm run legacy:build` → `✓ built` (output in `legacy-dist/`, gitignored).

Run the original for side-by-side comparison with `npm run legacy:dev` → http://127.0.0.1:5174

> Note: an old `npm run dev` (Vite) process from the first session may still be running on port 5173 with the *old* root. It now serves nothing useful, because `index.html` moved. Stop it before starting anything new on 5173. Next.js is configured for port 3000.

## 3. What is done

### 3.1 Safety and setup (done)
- [x] Audited the existing codebase: 8 source modules and the HTML.
- [x] `git init`, committed the baseline, tagged `vite-baseline`, created branch `next-migration`.
- [x] Moved the Vite app into `legacy-vite/` with `git mv` (history kept, content unchanged).
- [x] Installed (pinned in package.json): `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `typescript@5`, `@types/react@19`, `@types/react-dom@19`, `@types/node@22`, `@types/three@0.170.0`, `eslint@9`, `eslint-config-next@16.4.6`, `@playwright/test@1.65.0`.
  - Runtime libraries are unchanged: `three@0.170.0`, `gsap@3.12.5`, `lenis@1.1.18`. `vite@6.0.7` is kept only to run the legacy reference.
  - **No new runtime dependencies** were added. React Three Fiber was not added, by design.
- [x] `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `legacy:dev`, `legacy:build`, `test:e2e`.
- [x] `tsconfig.json`: strict, `@/*` → `./src/*`, excludes `legacy-vite` and `legacy-dist`.
- [x] `next.config.ts`: `reactStrictMode: true`.
- [x] `eslint.config.mjs`: flat config using `eslint-config-next/core-web-vitals` + `/typescript`, per the bundled Next 16 docs at `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md`. Next 16 `next build` no longer lints, so lint runs through `npm run lint`.
- [ ] **Playwright browsers not installed yet** (`npx playwright install chromium`). No `playwright.config.ts` and no tests yet.

### 3.2 Three.js layer: ported to TypeScript (done; `npx tsc --noEmit` exits 0)

| New file | Ported from | What changed | What did NOT change |
|---|---|---|---|
| `src/three/transformer.ts` | `legacy-vite/src/transformer.js` | Types added. Fan stored as `bank.userData.fan` instead of `children.at(-1)`, which gives the same object. Ghost line material is now returned as `lineMaterial` instead of `lines.userData.mat`. Shared canvas textures exported through `sharedTextures()`. | All geometry, dimensions, materials, colours, textures, anchors, shadow flags |
| `src/three/stage.ts` | `legacy-vite/src/stage.js` | New `dispose()`: removes the resize listener, disconnects the IntersectionObserver, disposes scene geometry, materials and textures (shared textures are kept), the PMREM and env render target, then `renderer.dispose()` and `forceContextLoss()`. New `disposeObject()` helper. | Renderer settings (DPR cap 1.75, ACES, PCFSoft shadows), environment intensity, visibility-gated rendering, `project()`, `lerp`, `smooth` |
| `src/three/heroScene.ts` | `legacy-vite/src/hero.js` | Now `createHeroScene({section, canvas, leaders, reduced})` returns `{start, dispose}`. The intro timeline and ScrollTriggers sit inside `gsap.context(…, section)`, so one `revert()` removes them. The rAF loop is cancellable; pointer and resize listeners are removed; leader SVG nodes are removed on dispose. | Camera poses (macro → wide → exit, desktop and mobile), light sweep values (key 340, rim, copper kicker, hemi), intro timings and easings, annotation offsets and safe-zone logic, count-up, scroll exit |
| `src/three/anatomyScene.ts` | `legacy-vite/src/anatomy.js` | Now `createAnatomyScene({pin, canvas, leaders, reduced})` returns `{dispose}`. The pin and step tweens are in a `gsap.context`, and step tweens are added with `ctx.add`. `setStep(0)` now runs **before** the ScrollTrigger is created; this fixes a latent ordering bug when the page loads already scrolled. The floating label and leader are removed on dispose. | The 5 keyframes (same values as the final legacy version), orthographic camera with `FRUST` 10.5 and view offsets, wall ghosting and edge lines, cover, yoke and winding lifts, HV lift ratios, 500vh pin, counter-roll step animation, label placement |
| `src/three/drawings.ts` | `legacy-vite/src/drawings.js` | Types added. Exports `drawingSvg(name)` as a pure string function, so it can render on the server with no hydration drift. `renderDrawings()` (DOM injection) was removed. | Every drawing path, dimension, centre line and label |

### 3.3 Empty folders created (no files yet)
`src/app/`, `src/components/`, `src/lib/animations/`, `src/lib/scrolling/`, `src/content/`

## 4. What remains (in order)

### Step A: finish the 1:1 port with ORIGINAL content, so parity can be measured
1. **`src/app/globals.css`**: copy `legacy-vite/src/styles.css` verbatim. Change only the font tokens:
   `--serif: var(--font-serif), "Instrument Serif", …`, `--sans: var(--font-sans), "Archivo", …`, `--mono: var(--font-mono), "Martian Mono", …`.
2. **`src/app/layout.tsx`** (server component):
   - Use `next/font/google` for `Archivo` (`axes: ['wdth']`, variable `--font-sans`), `Instrument_Serif` (weight 400, normal and italic, `--font-serif`) and `Martian_Mono` (`--font-mono`).
   - Copy the metadata title and description from `legacy-vite/index.html`, and `themeColor: '#0d0c0a'` through `viewport`.
   - `<html lang="en" suppressHydrationWarning>`, because an inline `<script>` adds the `js` class before hydration, exactly as the original did.
3. **Lenis singleton.** `src/lib/scrolling/lenis.ts` provides `getLenis()` and `scrollTo()`. `src/components/SmoothScroll.tsx` (client) wraps `<main>`. Because it is the parent, its effect runs after the children's effects. It:
   - creates Lenis (`lerp .085, wheelMultiplier .9`) and wires `lenis.on('scroll', ScrollTrigger.update)`;
   - adds the `gsap.ticker` raf and `lagSmoothing(0)`;
   - calls `lenis.resize()` on ScrollTrigger refresh;
   - runs the delegated `a[href^="#"]` click handler, which closes the register and scrolls;
   - sets `history.scrollRestoration='manual'`;
   - calls `ScrollTrigger.sort()` then `ScrollTrigger.refresh()`, and refreshes again on `window.load`;
   - in cleanup: `lenis.destroy()`, remove the ticker callback and the listeners.
   - Lenis is skipped when the user prefers reduced motion.
4. **Animation modules** in `src/lib/animations/`. Each is ported from `legacy-vite/src/main.js` and exports `init(root, {reduced}) => cleanup`, using `gsap.context(…, root)`:
   - `winding.ts`: word scrub plus the coil clip-path and turn counter (TOTAL 1184).
     - The words must be rendered as `<span className="w">` in JSX. Do NOT split innerHTML at runtime, because that would mutate React-owned DOM.
   - `record.ts`: rows, count-up readings, stamp slam and sheet nudge.
   - `sectors.ts`: the `--w` width axis condensing from 125 to 62.
   - `enquire.ts`: title clip reveal and title-block wipe; the `data-year` text.
   - `range.ts`: port `legacy-vite/src/range.js`. `gsap.matchMedia()` with the horizontal pin plus `containerAnimation` stroke plotting (desktop), and the timed plot on mobile. Cleanup is `mm.revert()`.
   - `chrome.ts` (or inside `Navigation.tsx`):
     - sheet number and title roll, `body[data-tone]`;
     - the `at-top` class from a scroll listener (not a ScrollTrigger; see the legacy fix);
     - the gauge needle and readout;
     - the register open/close, Escape key, and `lenis.stop()`/`start()`.
     - Close the register on the `kprs:close-register` custom event, dispatched from the anchor handler.
5. **Components** (`'use client'` only where an effect is needed). Convert the markup from `legacy-vite/index.html` to JSX one-to-one: `class`→`className`, `<br>`→`<br />`, the `style` attributes, and the `aria-*` attributes kept.

   | Component | Markup | Notes |
   |---|---|---|
   | `Navigation.tsx` | `.tb`, `.gauge`, `#register` | The register `<tbody>` uses the same links |
   | `Hero.tsx` | `section.hero` | See WebGL canvas handling below |
   | `CopperWinding.tsx` | `section.winding` | |
   | `TransformerAnatomy.tsx` | `section.anatomy` | Keep `is-active` on the first `<li>` in JSX |
   | `ProductExhibition.tsx` | `section.range` | Plates use `<figure className="plate__drawing" dangerouslySetInnerHTML={{__html: drawingSvg(name)}} />` |
   | `Testing.tsx` | `section.record` | |
   | `Sectors.tsx` | `section.sectors` | |
   | `Footer.tsx` + `Contact.tsx` | `footer.enquire` | Contact is the `.enquire__top` block and Footer is the `.titleblock`. Keep the single `<footer>` element so the DOM and CSS stay the same. |
   | `src/app/page.tsx` | | Composes them in the original order. Effects run in tree order, so the hero pin is created before the anatomy pin, which is created before the range pin. This matches the original creation order. |

   **WebGL canvas handling** (in `Hero.tsx` and `TransformerAnatomy.tsx`), to avoid duplicate canvases and lost contexts under Strict Mode:
   - Render a host `<div aria-hidden>` positioned `absolute; inset:0` in place of the `<canvas>`.
   - In `useEffect`, create the `<canvas className="hero__canvas">` (or `anatomy__canvas`) imperatively and append it to the host.
   - Load the scene with a dynamic import: `import('@/three/heroScene')`, guarded by a `cancelled` flag.
   - In cleanup, call `dispose()` and remove the canvas.
   - Hero calls `start()` after `document.fonts.ready`.
6. Run `npm run typecheck`, `npm run lint` and `npm run build`. Fix anything they report.

### Step B: parity verification (Vite on :5174 and Next on :3000, same viewports)
7. `npx playwright install chromium`, then add `playwright.config.ts` and the `tests/` folder:
   - **Parity spec.** Take screenshots at 1366×633 and 1440×900 (desktop) and 390×844 (mobile) for:
     - hero after the intro;
     - winding mid-way;
     - anatomy at progress 0.02 / 0.3 / 0.5 / 0.75 / 0.98;
     - range plates I–V;
     - record after the stamp;
     - sectors;
     - footer.
   - Use `page.clock` to freeze time, which makes the WebGL and GSAP output deterministic. Run the legacy project with `--update-snapshots` to make the baselines, then run the Next project against the same snapshot paths with a small tolerance.
   - **Canvas count check:** exactly 2 canvases after load, and still 2 after a Strict Mode dev remount.
   - **Console and hydration check:** zero errors, and no "Hydration failed" or "did not match" warnings.
   - **Reduced motion:** `reducedMotion: 'reduce'`. The title is visible, the coil is full, the counter reads 1184, and the readings are final.
   - **Performance:** frame rate during a scripted scroll, JS heap, and JS bundle size (legacy was 646.7 kB minified / 183.9 kB gzip in a single chunk). Compare legacy against Next.
8. Fix any visual differences caused by the migration, then commit (only once the user approves committing).

### Step C: content accuracy (separate commit after parity, so parity diffs stay clean)
9. Move all copy into `src/content/site.ts` and apply the **verified facts** below. Anything that can't be verified gets removed or clearly labelled as illustrative. Do not invent replacement values.

### Step D: final verification
10. `typecheck`, `lint`, `build`, Playwright (parity, animation, reduced motion, console, performance). Visual review at desktop and mobile. **No deploy without approval.**

## 5. How the 3D, GSAP and scroll behaviour is being preserved

- **No rewrite of the 3D.** The procedural transformer is driven by direct Three.js, ported line for line. React Three Fiber was intentionally not used, because it would mean rebuilding the scene graph and render loop for no measurable gain and with high regression risk.
- **Same numbers.** Camera poses, keyframes, light intensities, exposure, fog, shadow settings, DPR cap, GSAP durations, easings, staggers, ScrollTrigger start/end values and pin lengths are all copied unchanged. Only types and teardown were added.
- **Same render strategy.** Each scene renders only while its canvas intersects the viewport (IntersectionObserver with a 10% margin), as before. The GPU load is the same: the same two WebGL contexts, 2048 shadow maps and DPR ≤ 1.75.
- **Same CSS.** `styles.css` is copied verbatim into `globals.css`. Only the font tokens point at `next/font` variables for the same three families.
- **Strict Mode safety.** Every init returns a cleanup that reverts its `gsap.context` (which kills tweens, ScrollTriggers and pin spacers) and removes listeners and DOM it injected. The WebGL scenes cancel their rAF loop, dispose GPU resources and force context loss. Canvases are created per mount, so a remount never reuses a lost context.
- **Hydration safety.**
  - SVG drawings are generated as pure strings during render, so server and client output match.
  - The only random values (lamination and paint noise textures) are generated client-side inside effects.
  - `suppressHydrationWarning` is set only on `<html>`, for the pre-hydration `js` class.

## 6. Content verification (researched; NOT yet applied anywhere)

The official site was confirmed as **https://kprs.in** (pages read: `/`, `about.php`, `contact.php`, `power.php`, `furnace.php`, `dry.php`, `distribution.php`). The company is **Kiran Power Rectification Services Pvt. Ltd. (KPRS)**, established 1992 (stated on the home page).

| Topic | Verified fact (as published) | Replaces invented content |
|---|---|---|
| Classes | "11, 33, 132 KV class of transformers". Also furnace, isolation and motor-starting units built to customer specification. | — |
| Power | 5 MVA up to 50 MVA. Primary 33/66/132 kV, secondary 11/22/33 kV. On-load tap changer, 17 positions. IEC 60076, IS 2026. Facility to build and test 50 MVA / 132 kV units. | hero "63 MVA", plate II "5–63 MVA", "ONAN/ONAF" |
| Distribution | "25 KV to 2500 KV" range. The body text says 3150, which conflicts. Primary 11/22/33 kV, secondary 433 V. Off-load tap changer 5/7/9 positions, on-load 9/11/17. IS 1180, IS 2026. Oil filled. Aluminium or copper conductor. | "BEE Level 1–3" (not stated) |
| Dry type | Class F and H. "63KV to 2000 KV", with or without OLTC. 11000 V / 433 V. Air cooled. IS 11171. | "100–5 000 kVA", "up to 33 kV" |
| Furnace | "63KV to 2500KV" with customisation. Oil cooled or forced-oil cooled. Off-load rotary switches. 50 Hz. | "to 60 kA", "6/12/24 pulse", "OFWF" |
| Plate V | **Not offered as stated.** There is no inverter-duty or renewables product. The site lists "isolation, motor starting" as special applications. | the "Inverter-duty & renewables" plate |
| Testing | "100% routine testing as per IS 2026 and IS 1180". Test reports and certificates are provided to customers. | — |
| Certification | BIS licensed, ISO certified (the footer says ISO 9001-2008), MSME/SSI registered, a BIS & BEE certificate PDF (not read). | — |
| Sectors | Power distribution companies, utilities, electricity boards, REC; multi-storey buildings and industries; hotels and complexes (dry type); furnace metal melting. Marketed "across southern India". | solar, rail, data centres (not stated) |
| Address | Plot No.10, Bommasandra-Jigani Link Road, Bommasandra, Bangalore, Karnataka, India | "Plot —, City, State" |
| Phone | 080 4207 7095 · +91 97411 58600 · +91 99015 99774 | "+91 00000 00000" |
| Email | sales@kprsindia.com | "enquiries@kprs.example" |

**Open questions for the user:**
- The site writes ratings as "KV" where kVA is evidently meant. Confirm that "25–2 500 kVA" is the right reading, and confirm 2 500 versus 3 150 for distribution.
- Confirm which phone number and email the website should show.
- The test certificate values, drawing dimensions, hero annotation specs (e.g. "145 kV BIL 650") and anatomy labels (e.g. "10 mm") are invented. The plan is to label the certificate as **SPECIMEN — illustrative values** and to replace drawing dimension figures with "W"/"H" symbols. This keeps the visuals and animations but removes the false precision. This needs the user's sign-off.

The site pages `infrastructure.php`, `certificate.php`, `clients.php` and `services.php` were not read. They may hold testing and client details.

## 7. Known issues and risks

- **The Next app does not run yet.** It has no `src/app`. `npm run dev` / `build` will fail until Step A is done.
- `npm run lint` has not been run. ESLint may flag `@typescript-eslint/no-non-null-assertion`-style issues; the `!` operator is used in the ported files.
- The `next/font` versions of the three fonts may differ slightly in metrics from the Google Fonts CSS the original used, because `next/font` adds size-adjusted fallbacks. Check this in the parity screenshots.
- In `heroScene.ts`, the count-up tweens started from the timeline callback are not registered in the context. They finish within 1.4 s, so this is harmless, but they could be wrapped in `ctx.add` for completeness.
- No commit has been made on `next-migration` yet. All migration work is uncommitted, as instructed.

## 8. Commands

```bash
# install (already done; needed on a fresh clone)
npm install
npx playwright install chromium        # not yet done

# original Vite reference (works today)
npm run legacy:dev                     # http://127.0.0.1:5174
npm run legacy:build                   # -> legacy-dist/

# Next.js (works only after Step A)
npm run dev                            # http://127.0.0.1:3000
npm run typecheck                      # passes today for src/three/*
npm run lint
npm run build && npm run start
npm run test:e2e                       # after tests are written

# recovery
git worktree add ../KPRS-vite vite-baseline   # pristine original, non-destructive
```

## 9. First action tomorrow

1. `cd D:\KPRS && git status`. Confirm you are on branch `next-migration` and the status matches §1.
2. Stop any stale process on port 5173.
3. Start Step A.1–A.2: create `src/app/globals.css` (verbatim CSS plus font tokens) and `src/app/layout.tsx`.


---

## 10. Session 2 (2026-11-13): migration completed

### 10.1 What was built
- `src/app/layout.tsx`, `page.tsx`, `globals.css` (byte-identical to `legacy-vite/src/styles.css`, plus one appended `.record__specimen` rule for Phase G).
- Fonts: `next/font/google` (Archivo wdth axis, Instrument Serif normal+italic, Martian Mono), self-hosted. **The CSS keeps the original family names, not `var(--font-*)`.** The variables put next/font's size-adjusted "… Fallback" faces in the stack, so `≤` rendered from Arial at 157 % and widened the record table by 22.5 px on mobile. Turbopack in Next 16.4 ignores `adjustFontFallback: false`. See the comment in `layout.tsx`.
- Presentational server components: `Navigation`, `Hero`, `CopperWinding`, `TransformerAnatomy`, `ProductExhibition`, `Testing`, `Sectors`, `Contact`, `Footer`. Copy and data live in `src/content/site.ts`.
- `src/components/MotionController.tsx` (the only client component) initialises everything from ONE effect, **in the legacy main.js order**: Lenis → hero → winding → anatomy pin → range pin → record → sectors → enquire → chrome. Pins must be created top-to-bottom, so per-component async effects were deliberately avoided. Canvases are created per mount and inserted where the original had them; cleanups run in reverse.
- `src/lib/animations/{winding,record,sectors,enquire,range,chrome}.ts` and `src/lib/scrolling/lenis.ts`: line-for-line ports, each in a `gsap.context`/`matchMedia` with a cleanup.
- Dev/prod port moved to **3100** (3000 is used by an unrelated project, `D:\webscafe_solutions\frontend`).

### 10.2 Verification (all against real browsers, headless Chromium + SwiftShader WebGL)
- `tsc`, `eslint`, `next build` (static prerender): pass.
- **Parity** (`tests/parity.spec.ts`, prod build vs legacy, 390/768/1440/1920; output in `parity-results/`, gitignored). Run on the parity-state build, before Phase G: **page geometry identical at all four viewports.** Non-WebGL states differ in ≤ 0.3 % of pixels. The 3D mid-transition frames differ by up to 9 %, because the anatomy lerp (.085 per frame) and the hero drift (`sin(t)`) depend on frame rate and time. They were confirmed visually as the same step, labels and framing.
- **Runtime** (`tests/runtime.spec.ts`), 7/7 on dev (Strict Mode) and prod:
  - exactly 2 live WebGL contexts after the Strict remount; no duplicate leaders, labels or pin spacers;
  - zero console or hydration errors;
  - sheet roll, tone, gauge, at-top; coil, turn counter, record count-up and stamp;
  - keyboard register (Enter/Escape/link);
  - reduced motion (no Lenis, final states);
  - mobile with no horizontal overflow.
- Headless note: rAF can stall unless a frame is forced. `tests/helpers.ts#pump` takes 1×1 captures while waiting.
- Bundle: app chunk (three + gsap + lenis + scenes) 180.7 KB gzip vs legacy 183.3 KB. React + the Next runtime add ~174 KB gzip.

### 10.3 Phase G content corrections (from kprs.in, re-read 2026-11-13)
- Hero: 63 MVA → "Rating to 50 MVA"; cooling → "Standard IEC 60076". The annotations no longer carry invented ratings.
- Plates I–IV: spec tables replaced with the published figures.
- Plate V: Inverter-duty → **Isolation & motor starting** (drawing relabelled "SPECIAL DUTY", LV1/LV2 removed, geometry unchanged).
- Drawings: every dimension → symbolic **W / H**. Furnace "60 kA" and "OFWF" removed. Range lede now says "Elevations are schematic."
- Test certificate: **"SPECIMEN — ILLUSTRATIVE VALUES"** banner; S/N blanked; the lede cites IS 2026 / IS 1180.
- Sectors: 6 invented → 4 published (transmission, industry, buildings, furnaces).
- Contact: sales@kprsindia.com, all three published numbers, Bommasandra address.
- Anatomy: "63 MVA" and "10 mm" removed.
- A pre-Phase-G snapshot of `src/` was kept in the session scratchpad to allow a two-commit split.

### 10.4 Open questions for the client
1. Distribution upper rating: **2 500 vs 3 150 kVA** (the site states both). Shown as "from 25 kVA" until confirmed.
2. Primary phone number (all three are shown).
3. The site writes "KV" for ratings; shown as kVA.
4. Not yet reviewed against the site (marketing prose, left as in the original): the winding manifesto ("CRGO M4", "vapour-phase drying", "nothing … subcontracted") and the anatomy step prose.
5. Pre-existing original behaviour: the title block never shows SHT 07 at 1440×900, because the footer's `top 30px` start is below max scroll. Unchanged.

### 10.5 Not done
- No commit (awaiting approval). No push or deploy.
- Real-GPU performance (FPS, heap) was not measured; headless SwiftShader numbers are not representative.


---

## 11. Project cleanup (2026-11-13)

**Removed** (all untracked, generated, and regenerable; nothing in `src/`, `tests/` or config reads them):
| Path | What it was | How to regenerate |
|---|---|---|
| `legacy-dist/` | Vite production build (3 files) | `npm run legacy:build` |
| `parity-results/` | Parity screenshots + diff JSON (136 files, 20 MB). Numbers are recorded in §10.2 | `npx playwright test parity` (needs `legacy:dev` and the Next server running) |
| `test-results/` | Playwright last-run marker | any Playwright run |
| `tsconfig.tsbuildinfo` | TypeScript incremental cache | `tsc` / `next build` |

**Moved:** `KPRS_MIGRATION_PROGRESS.md` → `docs/KPRS_MIGRATION_PROGRESS.md`. Nothing else referenced it.

**Preserved:**
- `legacy-vite/` (original source; awaiting approval to remove). It is also recoverable from tag `vite-baseline` (6ae2d1f).
- `.next/` (managed by Next; the dev server was running).
- `node_modules/`.
- `AGENTS.md` (written by `next dev`; it points agents at the bundled Next 16 docs and is re-created if deleted).

**Servers:** stopped the KPRS production server (:3101, an orphan) and the KPRS legacy Vite server (:5174). Left the KPRS dev server (:3100) running. The Webscafe Solutions server (:3000) was not touched.

**Verified after cleanup** (dev server, `D:\KPRS`, http://localhost:3100):
- tsc, eslint and `next build` pass.
- Page, CSS and the 4 font files return 200.
- Runtime suite 6/6 (the legacy-comparison test was skipped because the legacy server was stopped).
- Hero, anatomy and range visually confirmed in screenshots.

**Before `legacy-vite/` can be removed**, also remove or adjust:
- the `legacy:dev` / `legacy:build` scripts and the `vite` devDependency;
- the `legacy-vite` / `legacy-dist` entries in `tsconfig.json` `exclude`, `eslint.config.mjs` ignores and `.gitignore`;
- the legacy-comparison tests (`tests/parity.spec.ts`, the "same structure as legacy" test in `tests/runtime.spec.ts`).

The `// Ported from legacy-vite/…` comments in `src/` can stay as provenance.

---

## 12. 3D performance optimisation (2026-11-13)

**Test rig:**
- Intel UHD Graphics (integrated, a real GPU via ANGLE/D3D11, not SwiftShader) in headless Chromium.
- Production builds. "Before" is the same source minus these changes, served side by side.
- A scripted wheel scroll through the whole page with Lenis active.
- Draw calls and triangles are counted per canvas per frame by wrapping WebGL draw calls; layout, style and script time come from CDP Performance metrics.
- Phones and tablets are *emulated* (390 @ 3×, 768 @ 2×) on the same Intel GPU. No real phone GPU was tested.

**Causes found (by profiling, not assumption):**
1. **Load freeze of 6–9 s.** The first `render()` compiled every shader synchronously (`getUniforms` → ANGLE → D3D11).
2. **The anatomy redrew an identical frame 60×/s while idle** (~570 ms/s of main-thread JS).
3. **Forced layouts every frame.** Hero note widths, the anatomy label width, the gauge height and the canvas `clientWidth`/`clientHeight` were all read after style writes.
4. **~333 draw calls per frame per scene** (about 165 meshes × main + shadow pass).
5. **A 350 ms hitch on first scroll into the anatomy**: its shadow shaders compiled lazily.

**Changes** (none alters geometry, materials, lights, cameras, keyframes, easing or timings):
- `stage.ts`:
  - `compileInBackground()`: KHR_parallel_shader_compile, cancellable, and safe under Strict Mode (a cancelled compile always reports not-ready).
  - Cached canvas `size`; `project()` uses it.
- `heroScene.ts`:
  - Background compile.
  - The intro starts only after the first frame is drawn, so with `lagSmoothing(0)` it can't jump ahead.
  - Note widths measured once (after fonts load, and on resize); `visibility` is written only on change.
  - `T.active.visible = false`: the core and windings are enclosed by the tank at every hero pose and can't affect the image or its shadows.
- `anatomyScene.ts`:
  - Background compile, plus a warm-up draw at load (before the intro starts), which removes the first-scroll hitch.
  - **Demand rendering**: redraw only when smoothed progress moves by > 1e-5 (≈ 0.05 px of scroll) or on step change, resize or ready.
  - Label width cached per step.
- `batch.ts` + `transformer.ts`: same-material meshes inside each rigidly-moving group are merged (vertices baked, materials unchanged). Walls (transparent in the anatomy) and InstancedMeshes are left as they were.
- `chrome.ts`: gauge height cached on resize.
- `MotionController.tsx`: the intro starts after `fonts.ready` and the anatomy warm-up.

**Results, 1440×900, medians of 3 alternating runs each:**

| Metric | Before | After |
|---|---|---|
| Longest main-thread block at load | 9,204 ms | **2,160 ms** |
| Total long-task time at load | 10,263 ms | **3,241 ms** |
| Hero idle FPS / frames > 33 ms | 32.4 / 26 | **59.5 / 0** |
| Hero idle main-thread script | 682 ms/s | **346 ms/s** |
| Hero idle layouts/s | 107 | **59** (1 per frame, no forced reads) |
| Hero draw calls / frame | 333 | **97** |
| Anatomy draw calls / frame (while moving) | 338 | **138** |
| Anatomy idle script | 570 ms/s | **12 ms/s** (no redraws) |
| Scroll FPS | 48.2 | **55.6** |
| Scroll frames > 33 ms | 89 | **30** |
| Scroll long tasks | 47 | **3** |
| Scroll main-thread script | 325 ms/s | **197 ms/s** |

- **1920@1 and 768@2:** single runs; same pattern (load block 7.9 s → 2.2 s and 7.3 s → 1.4 s; script halved).
- **390@3 scroll:** inconclusive. It is GPU fill-bound (two 682×1477 canvases), and 3 runs per side overlapped (median 53.1 before vs 49.8 after; the best run was "after" at 58.6). The changes don't affect fill rate.
- **Heap:** unchanged (~13–15 MB).

**Visual parity:** deterministic comparison (reduced motion, paused fake clock, seeded `Math.random`):
- Anatomy at 5 stages: ≤ 46 px differ out of 1.3 M, ≤ 2/255 (float rounding from baked transforms).
- Range: identical.
- Hero: within the same build's own run-to-run noise (sub-pixel annotation placement).
- Normal-motion intro sequence checked on a contact sheet: plays from the first frame, nothing skipped.

**Not done (deliberately):**
- Adaptive pixel ratio. No measurable desktop need; the mobile emulation isn't representative of phone GPUs; and it would lower resolution.
- Hero demand rendering. The hero animates continuously (drift, light breathing, fans).

**Verified:**
- tsc, eslint, `next build`.
- Runtime suite 6/6 on production and on dev (Strict Mode).
- A Strict-Mode race found during this work (a draw on a disposed renderer when KHR is unavailable) was fixed and re-verified over 6 repeated loads.

## 13. Branding, inner pages and dedicated mobile UI (2026-11-13)

Checkpoint before this work: commit `9628915` on `next-migration` (local, not pushed).

### Branding
- Logo: official PNGs from kprs.in (`templates/constructone/images/kiranlogo.png`, 833×64, and
  `logo-2.png`, 120×72). No SVG exists on the site. Saved unaltered in `public/brand/` and
  `src/assets/brand/`. The header shows the compact mark on a white nameplate so the artwork
  reads on dark and light sections without modification.
- Colours: KPRS blue `#014A86` (logo + site CSS) and orange `#EA4B1C` (logo + site CSS).
  Button fill `#D2401A` and text-on-paper `#B8380F` are darker tones of the same orange for AA contrast.
- Type: Manrope (display), Inter (body), IBM Plex Mono (technical annotation only). Archivo is
  kept only for its width axis (anatomy step numerals, sector names animate along it).
- Anatomy drawing grid replaced by soft daylight on the paper; other technical drawings kept.

### Structure
- Global `SiteHeader` (desktop nav + Products menu + CTA; phone full-screen menu with focus
  trap, scroll lock incl. Lenis, Escape) and `SiteFooter` in the root layout. The homepage
  title-block nav, sheet roll and drawing register were removed (replaced by the header).
- Routes: `/about`, `/products`, `/products/[slug]` (4, static), `/manufacturing`,
  `/infrastructure`, `/quality`, `/contact`, plus `sitemap.xml`, `robots.txt`, 404.
  No `/clients` page: kprs.in lists client logos only, no names (decision: skip).
- Content: `src/content/company.ts`, sourced from kprs.in; open questions marked CONFIRM there.
- Inner-page motion: `PageMotion` (one GSAP context per page, reverted on route change) and
  `lib/animations/tone.ts` (header tone from the section under the header line).
- Contact form validates client-side and is labelled as a demo; nothing is sent. A valid
  submission offers the same enquiry as a pre-filled email.

### 3D
- No change to geometry, materials, lighting, poses, timings or the render loops.
- Phone hero only: a view offset shifts the image down 24 % of the frame so the headline sits
  above the machine and the actions below it (`MOBILE_SHIFT` in heroScene.ts).
- The intro timeline also fades in the new hero lede and buttons.

### Phone layouts
- Hero: headline top, machine centre, ratings strip + two CTAs bottom.
- Anatomy: step card on a translucent panel at the bottom; all five stages kept.
- Range: swipeable scroll-snap carousel (intro card + 5 plates + end card); each drawing plots
  when swiped into view; rail shows plate number and progress.
- Test record: rows reflow into two-line entries (no sideways scroll).
- `main { overflow-x: clip }` stops the QA stamp's pre-animation scale widening the page.
