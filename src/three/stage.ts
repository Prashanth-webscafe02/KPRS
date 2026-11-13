// Shared renderer setup + helpers for both WebGL scenes.
// Same renderer settings as the Vite build; adds full teardown so React
// Strict Mode remounts never leave a second context or listener behind.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sharedTextures } from './transformer';

export interface Size { w: number; h: number }

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  resize: () => void;
  /** Canvas CSS size, cached on resize so per-frame code never forces a layout read. */
  size: Size;
  isVisible: () => boolean;
  dispose: () => void;
}

export function createStage(canvas: HTMLCanvasElement, { alpha = false, envIntensity = .35 } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, .04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = envIntensity;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);

  const size: Size = { w: canvas.clientWidth, h: canvas.clientHeight };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    size.w = w; size.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Render only while on screen
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' });
  io.observe(canvas);

  const dispose = () => {
    window.removeEventListener('resize', resize);
    io.disconnect();
    disposeObject(scene);
    room.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => x.dispose()); }
    });
    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return { renderer, scene, camera, resize, size, isVisible: () => visible, dispose };
}

/**
 * Compile every shader the scene needs without blocking the main thread.
 *
 * The first render() otherwise compiles and links each program synchronously
 * (on Windows/ANGLE→D3D11 that measured ~5.6 s of frozen main thread at load).
 * With KHR_parallel_shader_compile the driver compiles in the background and we
 * poll for completion; rendering starts once every program is ready, so the
 * first frame drawn is identical to before, just not preceded by a freeze.
 *
 * Same idea as three's renderer.compileAsync(), but cancellable: a disposed
 * scene (Strict Mode remount, unmount) stops polling instead of querying
 * programs on a lost context.
 */
export function compileInBackground(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  let cancelled = false;
  let timer = 0;
  const materials = renderer.compile(scene, camera);
  const parallel = renderer.extensions.has('KHR_parallel_shader_compile');
  const raw = new Promise<boolean>(resolve => {
    // Without the extension, readiness can't be polled without blocking: render
    // straight away, exactly as before.
    if (!parallel) { resolve(true); return; }
    const check = () => {
      if (cancelled) { resolve(false); return; }
      for (const m of materials) {
        const props = renderer.properties.get(m) as { currentProgram?: { isReady(): boolean } };
        if (!props.currentProgram || props.currentProgram.isReady()) materials.delete(m);
      }
      if (materials.size === 0) resolve(true);
      else timer = window.setTimeout(check, 16);
    };
    check();
  });
  // Re-check cancellation when the result is consumed: without the extension the
  // promise is already resolved, and React Strict Mode mounts, disposes and
  // remounts synchronously, so a consumer's .then() could otherwise draw with a
  // renderer whose context was just lost.
  const promise = raw.then(ok => ok && !cancelled);
  return { promise, cancel: () => { cancelled = true; clearTimeout(timer); } };
}

/** Release every geometry, material and non-shared texture under `root`. */
export function disposeObject(root: THREE.Object3D) {
  const keep = new Set<THREE.Texture>(Object.values(sharedTextures()));
  const mats = new Set<THREE.Material>();
  root.traverse(o => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => mats.add(x));
  });
  mats.forEach(mat => {
    for (const v of Object.values(mat)) {
      if (v instanceof THREE.Texture && !keep.has(v)) v.dispose();
    }
    mat.dispose();
  });
}

const _v = new THREE.Vector3();
export function project(obj: THREE.Object3D, camera: THREE.Camera, size: Size) {
  obj.getWorldPosition(_v);
  _v.project(camera);
  return {
    x: (_v.x * .5 + .5) * size.w,
    y: (-_v.y * .5 + .5) * size.h,
    behind: _v.z > 1,
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
