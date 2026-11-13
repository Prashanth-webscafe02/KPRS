// SHT 03 — Scroll-controlled engineering exploration.
// Orthographic (axonometric) camera on drawing paper: the language of a
// technical illustration. Scroll opens the tank, lifts the cover, strips the
// windings off the core, then puts it all back.
// Ported from legacy-vite/src/anatomy.js — keyframes, framing and timings unchanged.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildTransformer, type AnchorName } from './transformer';
import { createStage, project, lerp, smooth, compileInBackground } from './stage';

interface Key { rad: number; cover: number; walls: number; wind: number; yoke: number; hv: number; az: number; el: number; zoom: number; ty: number }

// One keyframe per chapter. Units: metres / radians.
const KEYS: Key[] = [
  { rad: 0,   cover: 0,   walls: 0, wind: 0,   yoke: 0,   hv: 0, az: .72,  el: .5,  zoom: 1.05, ty: 1.7 },
  { rad: .1,  cover: 2.1, walls: 0, wind: 0,   yoke: 0,   hv: 0, az: .5,   el: .56, zoom: .82,  ty: 2.7 },
  { rad: .55, cover: 3.6, walls: 1, wind: 1.9, yoke: 2.9, hv: 0, az: -.35, el: .42, zoom: .78,  ty: 3.5 },
  { rad: .55, cover: 2.6, walls: 1, wind: 0,   yoke: 1.2, hv: 1, az: -.62, el: .3,  zoom: .92,  ty: 2.3 },
  { rad: 0,   cover: 0,   walls: 0, wind: 0,   yoke: 0,   hv: 0, az: 1.02, el: .46, zoom: 1.05, ty: 1.7 },
];

function sample(p: number): Key {
  const f = p * (KEYS.length - 1);
  const i = Math.min(KEYS.length - 2, Math.floor(f));
  // hold on each keyframe briefly, then travel
  let t = f - i;
  t = smooth(Math.min(1, Math.max(0, (t - .18) / .64)));
  const a = KEYS[i], b = KEYS[i + 1];
  const o = {} as Key;
  (Object.keys(a) as (keyof Key)[]).forEach(k => { o[k] = lerp(a[k], b[k], t); });
  return o;
}

export interface AnatomySceneOptions {
  pin: HTMLElement;
  canvas: HTMLCanvasElement;
  leaders: SVGSVGElement;
  reduced: boolean;
}

export function createAnatomyScene({ pin, canvas, leaders: svg, reduced }: AnatomySceneOptions) {
  gsap.registerPlugin(ScrollTrigger);
  const stage = createStage(canvas, { alpha: true, envIntensity: .7 });
  const { renderer, scene, isVisible, size } = stage;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMappingExposure = 1.08;

  // orthographic camera replaces the stage's perspective one
  const FRUST = 10.5;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 200);
  const mobile = () => window.innerWidth < 860;
  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight, a = w / h;
    camera.left = -FRUST * a / 2; camera.right = FRUST * a / 2;
    camera.top = FRUST / 2; camera.bottom = -FRUST / 2;
    // push the drawing away from the text column
    if (mobile()) camera.setViewOffset(w, h, 0, h * .03, w, h);
    else camera.setViewOffset(w, h, w * .02, -h * .07, w, h);
    camera.updateProjectionMatrix();
    // resizing clears the drawing buffer and moves the label: redraw
    dirty = true; floatW = -1;
  };
  // Demand rendering state (declared before fit() runs).
  let dirty = true;      // something other than scroll progress changed
  let floatW = -1;       // cached label width; -1 = measure on next draw
  let drawnSp = NaN;     // smoothed progress of the last drawn frame
  fit();
  window.addEventListener('resize', fit);

  const T = buildTransformer({ tone: 'paper', ghostLines: true });
  scene.add(T.root);

  // walls get their own material so they can ghost to a line drawing
  const wallMat = T.M.paint.clone();
  wallMat.transparent = true;
  Object.values(T.walls).forEach(w => w.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = wallMat; }));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ color: 0x2a2418, opacity: .2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x9a907c, 1.3));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.6);
  sun.position.set(-5, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 11, bottom: -4, near: .5, far: 40 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  scene.add(sun);

  /* --------------------------------------------------- annotation label */
  const lead = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  lead.innerHTML = '<polyline/><circle r="3"/>';
  svg.appendChild(lead);
  const float = document.createElement('div');
  float.className = 'anatomy__float';
  pin.appendChild(float);

  const steps = [...pin.querySelectorAll<HTMLLIElement>('[data-anatomy-steps] li')];
  const labels = steps.map(li => {
    const el = li.querySelector<HTMLElement>('.anatomy__label')!;
    return { text: el.textContent ?? '', anchor: el.dataset.labelAnchor as AnchorName };
  });
  const progressBar = pin.querySelector<HTMLElement>('[data-anatomy-progress]')!;

  let current = -1;
  const S = { p: 0, sp: 0 };

  const ctx = gsap.context(() => {}, pin);

  function setStep(i: number, instant = false) {
    if (i === current) return;
    const prev = steps[current];
    const next = steps[i];
    const dir = i > current ? 1 : -1;
    current = i;
    // tweens triggered later are added to the same context so revert() clears them
    dirty = true; floatW = -1; // new label text and anchor
    ctx.add(() => {
      float.textContent = labels[i].text;
      gsap.fromTo(float, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power3.inOut' });
      if (prev) {
        gsap.to(prev, { opacity: 0, y: -24 * dir, duration: instant ? 0 : .45, ease: 'power2.in', onComplete: () => prev.classList.remove('is-active') });
      }
      next.classList.add('is-active');
      const no = next.querySelector('.anatomy__no')!;
      const rest = [...next.children].filter(c => c !== no && !c.classList.contains('anatomy__label'));
      gsap.set(next, { opacity: 1, y: 0 });
      if (instant) return;
      // mechanical counter: the step number rolls up like a dial
      gsap.fromTo(no, { clipPath: 'inset(0 0 100% 0)', yPercent: 40 * dir }, { clipPath: 'inset(0 0 0% 0)', yPercent: 0, duration: .8, ease: 'expo.out', delay: .2 });
      gsap.fromTo(rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out', delay: .32 });
    });
  }
  setStep(0, true);

  /* ------------------------------------------------------------ scroll */
  ctx.add(() => {
    ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + window.innerHeight * 5,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: self => {
        S.p = self.progress;
        progressBar.style.transform = `scaleX(${self.progress})`;
        setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * .999 + .0001)));
      },
    });
  });

  /* ------------------------------------------------------------- frame */
  const tgt = new THREE.Vector3();
  const { walls, radiators, cover, windings, hvCoils, yokeT, lines, lineMaterial } = T;
  const hvLift = [.55, 1.45, .25];

  function apply(k: Key) {
    const wo = k.walls * .55;
    walls.front.position.z = walls.front.userData.home.z + wo;
    walls.back.position.z = walls.back.userData.home.z - wo;
    walls.left.position.x = walls.left.userData.home.x - wo;
    walls.right.position.x = walls.right.userData.home.x + wo;
    wallMat.opacity = 1 - k.walls * .94;
    wallMat.depthWrite = k.walls < .5;
    lineMaterial!.opacity = k.walls * .75;
    lines!.children.forEach(l => {
      const w = walls[l.userData.wall as keyof typeof walls];
      if (w) l.position.copy(w.position);
      else l.position.y = T.dims.base + T.dims.H + .035 + k.cover;
    });
    radiators.forEach(r => { r.position.x = r.userData.home.x + r.userData.side * (k.rad + wo); });
    cover.position.y = cover.userData.home.y + k.cover;
    yokeT.position.y = yokeT.userData.home.y + k.yoke;
    windings.forEach((w, i) => { w.position.y = w.userData.home.y + k.wind * (1 + i * .06); });
    hvCoils.forEach((h, i) => { h.position.y = k.hv * hvLift[i]; });
  }

  const polyline = lead.querySelector('polyline')!;
  const dot = lead.querySelector('circle')!;

  /* ------------------------------------------------------- shaders */
  // Compile off the main thread (the scene is off-screen at load); no draw until ready.
  let ready = false;
  const compile = compileInBackground(renderer, scene, camera);
  // Warm-up: draw one frame as soon as the shaders are ready, even off-screen.
  // The shadow-pass depth shaders are created inside three's renderer and can
  // only be compiled by drawing; doing it now (before the hero intro starts,
  // see MotionController) instead of on first scroll into view removes a
  // ~350 ms hitch mid-scroll. The frame drawn is the normal first frame.
  const warm = compile.promise.then(ok => {
    ready = ok;
    if (ok) draw();
  });
  // Label width changes once the web fonts arrive.
  document.fonts?.ready.then(() => { floatW = -1; dirty = true; });

  // Below this change in smoothed progress a redraw is sub-pixel (1e-5 of the
  // 500vh pin ≈ 0.05 px of scroll), so an unchanged frame is not redrawn. The
  // canvas keeps showing its last frame; the GPU and main thread go idle.
  const EPS = 1e-5;
  let raf = 0;
  function frame() {
    if (isVisible()) S.sp += (S.p - S.sp) * (reduced ? 1 : .085);
    if (ready && isVisible() && (dirty || !(Math.abs(S.sp - drawnSp) < EPS))) draw();
    raf = requestAnimationFrame(frame);
  }

  function draw() {
    {
      dirty = false;
      drawnSp = S.sp;
      const k = sample(S.sp);
      apply(k);
      tgt.set(0, k.ty, 0);
      const r = 40;
      camera.position.set(
        tgt.x + r * Math.cos(k.el) * Math.sin(k.az),
        tgt.y + r * Math.sin(k.el),
        tgt.z + r * Math.cos(k.el) * Math.cos(k.az),
      );
      camera.lookAt(tgt);
      camera.zoom = k.zoom * (mobile() ? .54 : 1);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      // leader from the active anchor to the floating label
      const a = project(T.anchors[labels[current].anchor], camera, size);
      const mob = mobile();
      const lx = a.x + (mob ? -40 : -130);
      const ly = mob ? a.y - 70 : Math.min(size.h - 110, Math.max(size.h * .42, a.y + 90));
      if (floatW < 0) floatW = float.offsetWidth;
      const w = floatW;
      float.style.transform = `translate(${Math.max(12, lx - w)}px, ${ly - 22}px)`;
      polyline.setAttribute('points', `${a.x},${a.y} ${lx + 20},${ly} ${Math.max(12, lx - w)},${ly}`);
      dot.setAttribute('cx', String(a.x)); dot.setAttribute('cy', String(a.y));
    }
  }
  frame();

  return {
    /** Resolves once the scene's shaders (including shadow pass) are compiled. */
    warm,
    dispose: () => {
      compile.cancel();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      ctx.revert();
      steps.forEach(s => s.classList.remove('is-active'));
      lead.remove();
      float.remove();
      wallMat.dispose();
      sun.shadow.map?.dispose();
      stage.dispose();
    },
  };
}
