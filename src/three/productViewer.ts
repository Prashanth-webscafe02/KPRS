// Product page exhibit: the shared procedural transformer on a turntable.
//
// Reuses the homepage pieces (buildTransformer, createStage, background shader
// compile, project) rather than duplicating them. It is loaded with a dynamic
// import, so three.js reaches a product page only when this section nears the
// viewport, and it renders on demand: frames are drawn only while the turntable,
// camera or entrance is still moving. At rest it costs nothing.
//
// The model is ILLUSTRATIVE. It is the generic three-phase, oil-immersed power
// transformer from the homepage, not a scan or drawing of a KPRS unit. For this
// page only (the homepage scenes build their own copy and are untouched):
//  - the tank is painted in admiralty grey, the finish KPRS publishes (IS 5
//    shade 631), sampled against the KPRS product photographs;
//  - the ONAF cooling fans are hidden: forced-air cooling is not part of the
//    published KPRS power transformer specification;
//  - the core and windings stay hidden, as in the hero: the tank never opens.
import * as THREE from 'three';
import { buildTransformer } from './transformer';
import { createStage, compileInBackground, project } from './stage';

export type PartId = 'conservator' | 'hv' | 'lv' | 'radiators' | 'tapchanger' | 'tank';

/** Turntable yaw, camera elevation and distance factor for each view. */
interface View { yaw: number; pitch: number; zoom: number; focus: number }
const OVERVIEW: View = { yaw: -.62, pitch: .2, zoom: 1, focus: 0 };
const VIEWS: Record<PartId, View> = {
  conservator: { yaw: -.95, pitch: .32, zoom: .9, focus: .45 },
  hv: { yaw: -.35, pitch: .28, zoom: .86, focus: .45 },
  lv: { yaw: 2.55, pitch: .32, zoom: .9, focus: .45 },
  radiators: { yaw: -1.35, pitch: .14, zoom: .9, focus: .4 },
  tapchanger: { yaw: -.12, pitch: .12, zoom: .88, focus: .45 },
  tank: { yaw: -.5, pitch: .12, zoom: .95, focus: .3 },
};

export interface ViewerOptions {
  canvas: HTMLCanvasElement;
  reduced: boolean;
  /** Called after a frame with the active part's marker position (CSS px in the canvas). */
  onMarker: (p: { x: number; y: number; visible: boolean } | null) => void;
  onReady: () => void;
}

export function createProductViewer({ canvas, reduced, onMarker, onReady }: ViewerOptions) {
  const stage = createStage(canvas, { alpha: true, envIntensity: .3 });
  const { renderer, scene, camera, size } = stage;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMappingExposure = 1.05;
  // The lights never move; the shadow map is redrawn only when the model turns.
  renderer.shadowMap.autoUpdate = false;

  /* the model */
  const T = buildTransformer({ tone: 'dark' });
  T.active.visible = false;
  // Base colours chosen so that, under the hero's light rig (unchanged), the
  // rendered tank matches the lit blue-grey of the KPRS photographs (~#99afbc).
  T.M.paint.color.set(0x56636b);
  T.M.fin.color.set(0x505c63);
  for (const bank of T.radiators) {
    const fan = bank.userData.fan as THREE.Group | undefined;
    if (fan) fan.visible = false;
  }
  const table = new THREE.Group();
  scene.add(table);
  table.add(T.root);
  // centre the footprint on the turntable axis
  const box = new THREE.Box3().setFromObject(T.root);
  const centre = box.getCenter(new THREE.Vector3());
  T.root.position.set(-centre.x, 0, -centre.z);
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  const aim = new THREE.Vector3(0, centre.y * .92, 0);

  /* anchors the homepage model already carries, plus two placed for this page */
  const lv = new THREE.Object3D(); lv.position.set(.31, .62, -.3); T.cover.add(lv);
  const tap = new THREE.Object3D(); tap.position.set(-1.0, .55, .45); T.walls.front.add(tap);
  const anchors: Record<PartId, THREE.Object3D> = {
    conservator: T.anchors.conservator,
    hv: T.anchors.bushing,
    lv,
    radiators: T.anchors.radiator,
    tapchanger: tap,
    tank: T.anchors.tank,
  };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .5 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* light: the hero's rig at its settled values (key, cold rim, copper kicker, hemi) */
  const key = new THREE.SpotLight(0xffe4c8, 340, 40, .42, .65, 1.2);
  key.position.set(-5.2, 7.5, 6.2);
  key.target.position.set(0, 1.2, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.0004;
  key.shadow.normalBias = .02;
  const rim = new THREE.DirectionalLight(0xdfe6ea, 2.4); rim.position.set(6, 4, -7);
  const kicker = new THREE.PointLight(0xc27b47, 3.2, 9, 1.6); kicker.position.set(1.5, .4, 3.2);
  const hemi = new THREE.HemisphereLight(0x5a5650, 0x0d0c0a, .5);
  scene.add(key, key.target, rim, kicker, hemi);

  /* view state: current eases toward target */
  const target: View = { ...OVERVIEW };
  const cur: View = reduced ? { ...OVERVIEW } : { yaw: OVERVIEW.yaw - .85, pitch: .3, zoom: 1.3, focus: 0 };
  let active: PartId | null = null;

  const fitDistance = () => {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * camera.aspect);
    return (radius / Math.sin(Math.min(v, h))) * .92;
  };
  let dist = fitDistance();
  const look = new THREE.Vector3(), focusPt = new THREE.Vector3();

  function place() {
    table.rotation.y = cur.yaw;
    table.updateMatrixWorld(true);
    if (active) anchors[active].getWorldPosition(focusPt); else focusPt.copy(aim);
    look.copy(aim).lerp(focusPt, cur.focus);
    const d = dist * cur.zoom;
    camera.position.set(look.x, look.y + Math.sin(cur.pitch) * d, look.z + Math.cos(cur.pitch) * d);
    camera.lookAt(look);
    camera.updateMatrixWorld();
  }

  function marker() {
    if (!active) { onMarker(null); return; }
    const p = project(anchors[active], camera, size);
    // hidden when the part faces away: anchor further from the camera than the axis
    const toCam = camera.position.distanceTo(anchors[active].getWorldPosition(focusPt));
    const visible = !p.behind && toCam < camera.position.distanceTo(look);
    onMarker({ x: p.x, y: p.y, visible });
  }

  /* demand loop */
  let raf = 0, last = 0, ready = false, dragging = false, lastYaw = NaN;
  const settled = () =>
    Math.abs(cur.yaw - target.yaw) < 1e-4 && Math.abs(cur.pitch - target.pitch) < 1e-4 &&
    Math.abs(cur.zoom - target.zoom) < 1e-4 && Math.abs(cur.focus - target.focus) < 1e-4;

  function frame(now: number) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60;
    last = now;
    const k = reduced ? 1 : 1 - Math.pow(1 - .085, dt * 60);
    (Object.keys(cur) as (keyof View)[]).forEach(n => { cur[n] += (target[n] - cur[n]) * k; });
    place();
    if (cur.yaw !== lastYaw) { renderer.shadowMap.needsUpdate = true; lastYaw = cur.yaw; }
    renderer.render(scene, camera);
    marker();
    if (inView && (dragging || !settled())) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  // The loop runs only while the canvas is on screen, so the entrance plays
  // when it is first seen (the module is loaded ahead of that) and a motion
  // interrupted by scrolling away resumes on return.
  let inView = false;
  const kick = () => { if (ready && inView && !raf) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; kick(); }, { threshold: .25 });
  io.observe(canvas);

  /* interaction: horizontal drag turns the table; vertical drag (mouse/pen)
     tilts. Touch keeps vertical page scroll (touch-action: pan-y in CSS). */
  let px = 0, py = 0;
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-dragging');
    kick();
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    target.yaw += (e.clientX - px) * .008;
    if (e.pointerType !== 'touch') target.pitch = THREE.MathUtils.clamp(target.pitch - (e.clientY - py) * .004, .04, .62);
    px = e.clientX; py = e.clientY;
  };
  const up = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    kick();
  };
  const keydown = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -.3, ArrowRight: .3 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    target.yaw += step;
    kick();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', keydown);

  const onResize = () => { dist = fitDistance(); place(); if (ready) { renderer.render(scene, camera); marker(); } };
  window.addEventListener('resize', onResize);

  place();
  const compile = compileInBackground(renderer, scene, camera);
  compile.promise.then(ok => {
    if (!ok) return;
    ready = true;
    renderer.shadowMap.needsUpdate = true;
    onReady();
    kick();
  });

  return {
    /** Frame a part, or the whole machine with null. Keeps the nearest equivalent yaw. */
    focus(id: PartId | null) {
      active = id;
      const v = id ? VIEWS[id] : OVERVIEW;
      const turns = Math.round((target.yaw - v.yaw) / (Math.PI * 2));
      Object.assign(target, v, { yaw: v.yaw + turns * Math.PI * 2 });
      if (!id) onMarker(null);
      kick();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      compile.cancel();
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', keydown);
      key.shadow.map?.dispose();
      stage.dispose();
    },
  };
}

export type ProductViewer = ReturnType<typeof createProductViewer>;
