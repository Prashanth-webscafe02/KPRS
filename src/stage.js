// Shared renderer setup + helpers for both WebGL scenes.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createStage(canvas, { alpha = false, envIntensity = .35 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = envIntensity;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Render only while on screen
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' }).observe(canvas);

  return { renderer, scene, camera, resize, isVisible: () => visible };
}

const _v = new THREE.Vector3();
export function project(obj, camera, canvas) {
  obj.getWorldPosition(_v);
  _v.project(camera);
  return {
    x: (_v.x * .5 + .5) * canvas.clientWidth,
    y: (-_v.y * .5 + .5) * canvas.clientHeight,
    behind: _v.z > 1,
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = v => Math.min(1, Math.max(0, v));
export const smooth = t => t * t * (3 - 2 * t);
