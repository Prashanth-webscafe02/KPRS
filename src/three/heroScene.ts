// SHT 01 — Cinematic reveal.
// Macro shot on the cooling fins, light comes up, camera pulls back to reveal
// the whole machine; annotations attach to real points on the model.
// Ported from legacy-vite/src/hero.js — camera poses, light values, timings
// and easings are unchanged.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildTransformer, type AnchorName } from './transformer';
import { createStage, project, lerp, compileInBackground } from './stage';

export interface HeroSceneOptions {
  section: HTMLElement;
  canvas: HTMLCanvasElement;
  leaders: SVGSVGElement;
  reduced: boolean;
}

export function createHeroScene({ section, canvas, leaders: svg, reduced }: HeroSceneOptions) {
  gsap.registerPlugin(ScrollTrigger);
  const stage = createStage(canvas, { envIntensity: .22 });
  const { renderer, scene, camera, isVisible, size } = stage;
  renderer.toneMappingExposure = 1.05;
  scene.fog = new THREE.Fog(0x0d0c0a, 14, 30);

  const T = buildTransformer({ tone: 'dark' });
  T.root.rotation.y = -.18;
  // The hero never opens the tank: the core and windings are wholly enclosed by
  // the opaque walls and lid at every camera pose (macro, wide, exit), and any
  // light ray reaching them passes through the tank first, so they can affect
  // neither the image nor its shadows. Skipping them saves ~20 % of the hero's
  // draw calls. (The anatomy scene, which does open the tank, keeps them.)
  T.active.visible = false;
  scene.add(T.root);

  // floor that only shows shadow + a faint warm pool
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: .55 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* lighting: a raking key that sweeps, a cold rim, almost no fill */
  const key = new THREE.SpotLight(0xffe4c8, 0, 40, .42, .65, 1.2);
  key.position.set(-6, 7.5, 6);
  key.target.position.set(0, 1.2, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -.0004;
  key.shadow.normalBias = .02;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0xdfe6ea, 0);
  rim.position.set(6, 4, -7);
  scene.add(rim);

  const kicker = new THREE.PointLight(0xc27b47, 0, 9, 1.6); // copper bounce from below-front
  kicker.position.set(1.5, .4, 3.2);
  scene.add(kicker);

  const hemi = new THREE.HemisphereLight(0x5a5650, 0x0d0c0a, .0);
  scene.add(hemi);

  /* camera rig */
  const mobile = () => window.innerWidth < 860;
  const poses = () => ({
    macro: { pos: new THREE.Vector3(3.3, 1.45, 2.2), tgt: new THREE.Vector3(2.15, 1.35, .25) },
    wide: mobile()
      ? { pos: new THREE.Vector3(11.5, 6.4, 18.5), tgt: new THREE.Vector3(.3, 0.2, 0) }
      : { pos: new THREE.Vector3(8.6, 3.9, 10.6), tgt: new THREE.Vector3(-2.3, 2.05, 0) },
    exit: { pos: new THREE.Vector3(2.6, 5.4, 4.4), tgt: new THREE.Vector3(-.4, 3.0, 0) },
  });
  let P = poses();
  const onResize = () => { P = poses(); widths = null; };
  window.addEventListener('resize', onResize);

  const state = { intro: reduced ? 1 : 0, exit: 0, light: reduced ? 1 : 0 };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    mouse.x = e.clientX / window.innerWidth - .5;
    mouse.y = e.clientY / window.innerHeight - .5;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const pos = new THREE.Vector3(), tgt = new THREE.Vector3();
  const easeIntro = (t: number) => 1 - Math.pow(1 - t, 3.2);

  /* annotations */
  const notes = [...section.querySelectorAll<HTMLLIElement>('.hero__notes li')];
  const OFFS: Partial<Record<AnchorName, [number, number]>> = { bushing: [-150, 30], conservator: [120, -36], radiator: [110, -70] };
  // Note widths only change with fonts or viewport; measuring them every frame
  // (after the previous frame's transform writes) forced 3 layouts per frame.
  let widths: number[] | null = null;
  const leaders = notes.map(li => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = '<polyline/><circle r="2.5"/><circle class="ring" r="7"/>';
    g.style.opacity = '0';
    svg.appendChild(g);
    return { li, g, key: li.dataset.anchor as AnchorName, poly: g.querySelector('polyline')!, shown: true };
  });

  function placeNotes() {
    if (mobile()) return;
    if (!widths) widths = leaders.map(L => L.li.offsetWidth); // one batched read, before any write
    leaders.forEach((L, i) => {
      const a = project(T.anchors[L.key], camera, size);
      const [dx, dy] = OFFS[L.key]!;
      const lx = a.x + dx, ly = a.y + dy;
      const w = widths![i];
      const safe = ly > 120 && ly < size.h - 200 && lx < size.w - 260;
      if (safe !== L.shown) {
        L.shown = safe;
        L.li.style.visibility = L.g.style.visibility = safe ? '' : 'hidden';
      }
      L.li.style.transform = `translate(${dx < 0 ? lx - 10 - w : lx + 10}px, ${ly - 8}px)`;
      const elbowX = a.x + dx * .45;
      const endX = dx < 0 ? lx - 4 : lx + 4;
      L.poly.setAttribute('points', `${a.x},${a.y} ${elbowX},${ly} ${endX},${ly}`);
      const [dot, ring] = [L.g.children[1], L.g.children[2]];
      dot.setAttribute('cx', String(a.x)); dot.setAttribute('cy', String(a.y));
      ring.setAttribute('cx', String(a.x)); ring.setAttribute('cy', String(a.y));
    });
  }

  // All tweens and triggers live in one context so a single revert() undoes them.
  let tl!: gsap.core.Timeline;
  const ctx = gsap.context(() => {
    /* ------------------------------------------------------------- intro */
    tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    if (!reduced) {
      tl.to(state, { light: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
        .to(state, { intro: 1, duration: 4.6, ease: 'none' }, .2)
        .to('.crop', { opacity: 1, duration: .6, stagger: .08 }, .5)
        .to('.hero__title .line > span', { y: 0, duration: 1.5, stagger: .14, ease: 'expo.out' }, 2.4)
        .to('.hero__eyebrow', { opacity: 1, duration: .9 }, 2.9)
        .to('.hero__meta', { opacity: 1, duration: .9 }, 3.4)
        .add(() => countUp(), 3.4)
        .to(leaders.map(l => l.g), { opacity: 1, duration: .6, stagger: .18 }, 4.1)
        .to(notes, { opacity: 1, duration: .6, stagger: .18 }, 4.25);
    } else {
      leaders.forEach(l => { l.g.style.opacity = '1'; l.li.style.opacity = '1'; });
    }

    function countUp() {
      section.querySelectorAll<HTMLElement>('[data-hero-count]').forEach(el => {
        const end = +el.dataset.heroCount!, o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + (el.dataset.suffix ?? ''); } });
      });
    }

    /* -------------------------------------------------------------- exit */
    ScrollTrigger.create({
      trigger: section, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: s => { state.exit = s.progress; },
    });
    gsap.to('.hero__copy', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: '60% top', scrub: true } });
    gsap.to(['.hero__meta', '.hero__notes', '.hero__leaders'], { opacity: 0, ease: 'none', scrollTrigger: { trigger: section, start: '5% top', end: '35% top', scrub: true } });
  }, section);

  /* ------------------------------------------------------- shaders */
  // Compile off the main thread; draw nothing until every program is ready.
  let ready = false;
  const compile = compileInBackground(renderer, scene, camera);
  compile.promise.then(ok => { ready = ok; });
  // Resolves after the first frame is actually drawn. That frame still compiles
  // the shadow-pass shaders synchronously; the intro must start after it, or
  // (with lagSmoothing(0)) the timeline would jump ahead by that stall.
  let markDrawn!: () => void;
  const firstDrawn = new Promise<void>(r => { markDrawn = r; });

  /* ------------------------------------------------------------- frame */
  const clock = new THREE.Clock();
  let raf = 0;
  let disposed = false;
  function frame() {
    const t = clock.getElapsedTime();
    if (ready && isVisible()) {
      mouse.sx += (mouse.x - mouse.sx) * .04;
      mouse.sy += (mouse.y - mouse.sy) * .04;

      const k = easeIntro(state.intro);
      pos.lerpVectors(P.macro.pos, P.wide.pos, k);
      tgt.lerpVectors(P.macro.tgt, P.wide.tgt, k);
      const e = state.exit * state.exit * (3 - 2 * state.exit);
      pos.lerp(P.exit.pos, e); tgt.lerp(P.exit.tgt, e);
      // slow drift + parallax, only once revealed
      const live = k * (1 - e);
      pos.x += (Math.sin(t * .11) * .35 + mouse.sx * .9) * live;
      pos.y += (-mouse.sy * .45) * live;
      camera.position.copy(pos);
      camera.lookAt(tgt);

      // light: sweeps from far left to raking front-left, then breathes
      const L = state.light;
      key.intensity = lerp(0, 340, L);
      key.position.x = lerp(-11, -5.2, L) + Math.sin(t * .23) * .9 * L;
      key.position.z = lerp(1.5, 6.2, L);
      rim.intensity = lerp(0, 2.4, Math.max(0, L * 1.3 - .3));
      kicker.intensity = lerp(0, 3.2, L);
      hemi.intensity = lerp(0, .35, L);
      renderer.toneMappingExposure = lerp(1.05, .7, e);

      // fan blades turn on the ONAF banks
      T.radiators.forEach(b => { if (b.userData.fan) (b.userData.fan as THREE.Object3D).rotation.y = t * 3; });

      renderer.render(scene, camera);
      markDrawn();
      placeNotes();
    }
    // ready but scrolled away: nothing will stall the intro, so let it start
    else if (ready) markDrawn();
    raf = requestAnimationFrame(frame);
  }
  frame();

  return {
    // The intro begins once the shaders are ready (previously the synchronous
    // compile froze the page first, so the intro also began after it).
    start: () => {
      widths = null; // fonts have loaded: re-measure the notes
      compile.promise.then(ok => {
        if (ok) firstDrawn.then(() => requestAnimationFrame(() => { if (!disposed) tl.play(); }));
      });
    },
    dispose: () => {
      disposed = true;
      compile.cancel();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      ctx.revert();
      leaders.forEach(l => { l.g.remove(); l.li.style.removeProperty('transform'); l.li.style.removeProperty('visibility'); l.li.style.removeProperty('opacity'); });
      key.shadow.map?.dispose();
      stage.dispose();
    },
  };
}
