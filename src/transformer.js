// Procedural model of a three-phase, oil-immersed power transformer.
// Built from engineering proportions, not decoration: tank, radiator banks,
// cover with condenser bushings and conservator, stepped CRGO core, LV/HV windings.
import * as THREE from 'three';

/* ---------------------------------------------------------------- textures */

function canvasTex(w, h, draw, { repeat = [1, 1], color = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let _shared;
function sharedTextures() {
  if (_shared) return _shared;
  // Disc-winding turns: copper bands separated by dark oil ducts
  const turns = (ctx, w, h) => {
    const band = h / 16;
    for (let i = 0; i < 16; i++) {
      const y = i * band;
      const g = ctx.createLinearGradient(0, y, 0, y + band);
      g.addColorStop(0, '#5a2c12');
      g.addColorStop(.12, '#c98352');
      g.addColorStop(.45, '#e8b080');
      g.addColorStop(.8, '#a8612f');
      g.addColorStop(.9, '#4a220c');
      g.addColorStop(1, '#2a1406');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, w, band);
    }
    // vertical spacer sticks (pressboard) every 1/8 of the circumference
    ctx.fillStyle = 'rgba(205,180,135,.85)';
    for (let i = 0; i < 8; i++) ctx.fillRect((i / 8) * w, 0, w / 90, h);
  };
  const turnsBump = (ctx, w, h) => {
    const band = h / 16;
    for (let i = 0; i < 16; i++) {
      const y = i * band;
      const g = ctx.createLinearGradient(0, y, 0, y + band);
      g.addColorStop(0, '#000'); g.addColorStop(.2, '#bbb'); g.addColorStop(.5, '#fff');
      g.addColorStop(.85, '#999'); g.addColorStop(1, '#000');
      ctx.fillStyle = g; ctx.fillRect(0, y, w, band);
    }
  };
  // CRGO laminations: very fine stacked sheets
  const lam = (ctx, w, h) => {
    ctx.fillStyle = '#8a8d90'; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      const v = 120 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${v},${v + 3},${v + 6})`;
      ctx.fillRect(x, 0, 1, h);
    }
  };
  // Painted steel: faint orange-peel variation for roughness
  const peel = (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 150 + Math.random() * 60;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
  _shared = {
    turnsMap: canvasTex(256, 256, turns, { repeat: [3, 1] }),
    turnsBump: canvasTex(32, 256, turnsBump, { repeat: [1, 1], color: false }),
    lamMap: canvasTex(256, 8, lam, { repeat: [2, 1] }),
    peel: canvasTex(128, 128, peel, { repeat: [6, 6], color: false }),
  };
  return _shared;
}

/* --------------------------------------------------------------- materials */

export function makeMaterials({ tone = 'dark' } = {}) {
  const t = sharedTextures();
  const paint = new THREE.MeshStandardMaterial({
    color: tone === 'dark' ? 0x2b2e30 : 0x5c6164,
    metalness: .35, roughness: .62, roughnessMap: t.peel,
  });
  return {
    paint,
    paintGhost: paint.clone(),
    fin: new THREE.MeshStandardMaterial({ color: tone === 'dark' ? 0x2a2c2e : 0x595e61, metalness: .45, roughness: .48 }),
    copper: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: t.turnsMap, bumpMap: t.turnsBump, bumpScale: 2.2,
      metalness: .92, roughness: .34,
    }),
    copperPlain: new THREE.MeshStandardMaterial({ color: 0xc27b47, metalness: 1, roughness: .3 }),
    core: new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.lamMap, metalness: .75, roughness: .42 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: 0x3b1f15, roughness: .16, metalness: 0, clearcoat: 1, clearcoatRoughness: .08 }),
    pressboard: new THREE.MeshStandardMaterial({ color: 0xc8ad7f, roughness: .85 }),
    bright: new THREE.MeshStandardMaterial({ color: 0xc9ccce, metalness: 1, roughness: .22 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1c1d1e, metalness: .4, roughness: .55 }),
  };
}

/* ---------------------------------------------------------------- geometry */

const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (r1, r2, h, m, seg = 40) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);

function shadowAll(obj) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

// Condenser bushing with porcelain sheds, built as a lathe profile
function bushing(height, rBody, nSheds, M) {
  const g = new THREE.Group();
  const pts = [];
  const rShed = rBody * 1.85;
  pts.push(new THREE.Vector2(0, 0), new THREE.Vector2(rBody * 1.05, 0));
  const pitch = height / nSheds;
  for (let i = 0; i < nSheds; i++) {
    const y = i * pitch;
    const big = i % 2 === 0;
    const r = big ? rShed : rShed * .82;
    pts.push(new THREE.Vector2(rBody, y + pitch * .15));
    pts.push(new THREE.Vector2(r, y + pitch * .38));
    pts.push(new THREE.Vector2(r * .97, y + pitch * .5));
    pts.push(new THREE.Vector2(rBody, y + pitch * .62));
  }
  pts.push(new THREE.Vector2(rBody * .9, height), new THREE.Vector2(0, height));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), M.porcelain);
  body.position.y = .1;
  g.add(body);
  const flange = cyl(rBody * 1.6, rBody * 1.7, .1, M.paint); flange.position.y = .05; g.add(flange);
  const cap = cyl(rBody * .95, rBody * 1.1, .14, M.bright); cap.position.y = height + .17; g.add(cap);
  const stud = cyl(rBody * .28, rBody * .28, .14, M.copperPlain, 16); stud.position.y = height + .3; g.add(stud);
  g.userData.top = height + .36;
  return g;
}

// Stepped (cruciform) section of a CRGO limb or yoke
const STEPS = [
  [1.00, .42], [.92, .62], [.80, .78], [.64, .90], [.44, .98],
];
function steppedBar(length, diameter, M, axis = 'y') {
  const g = new THREE.Group();
  for (const [w, d] of STEPS) {
    const sx = diameter * w, sz = diameter * d;
    const m = axis === 'y' ? box(sx, length, sz, M.core) : box(length, sx, sz, M.core);
    g.add(m);
  }
  return g;
}

function hollowCyl(rIn, rOut, h, mat, seg = 64) {
  const pts = [
    new THREE.Vector2(rIn, -h / 2), new THREE.Vector2(rOut, -h / 2),
    new THREE.Vector2(rOut, h / 2), new THREE.Vector2(rIn, h / 2),
    new THREE.Vector2(rIn, -h / 2),
  ];
  return new THREE.Mesh(new THREE.LatheGeometry(pts, seg), mat);
}

function radiatorBank(nFins, finDepth, finH, pitch, M) {
  const g = new THREE.Group();
  const finGeo = new THREE.BoxGeometry(finDepth, finH, .016);
  const inst = new THREE.InstancedMesh(finGeo, M.fin, nFins);
  const m4 = new THREE.Matrix4();
  const span = (nFins - 1) * pitch;
  for (let i = 0; i < nFins; i++) {
    m4.makeTranslation(finDepth / 2 + .18, 0, -span / 2 + i * pitch);
    inst.setMatrixAt(i, m4);
  }
  inst.castShadow = inst.receiveShadow = true;
  g.add(inst);
  // headers and flanged pipes back to the tank
  for (const y of [finH / 2 - .08, -finH / 2 + .08]) {
    const hdr = cyl(.045, .045, span + .12, M.paint, 16);
    hdr.rotation.x = Math.PI / 2; hdr.position.set(.18 + .09, y, 0); g.add(hdr);
    const pipe = cyl(.06, .06, .2, M.paint, 20);
    pipe.rotation.z = Math.PI / 2; pipe.position.set(.09, y, 0); g.add(pipe);
    const valve = cyl(.09, .09, .04, M.dark, 20);
    valve.rotation.z = Math.PI / 2; valve.position.set(.02, y, 0); g.add(valve);
  }
  g.userData.span = span;
  return g;
}

/* ------------------------------------------------------------------- build */

export function buildTransformer({ tone = 'dark', ghostLines = false } = {}) {
  const M = makeMaterials({ tone });
  const root = new THREE.Group();

  const W = 3.2, D = 1.7, H = 2.45, t = .05, base = .26;
  const yMid = base + H / 2;

  /* skid */
  const skid = new THREE.Group();
  for (const z of [-D * .32, D * .32]) {
    const web = box(W + .5, .2, .03, M.dark); web.position.set(0, .12, z);
    const top = box(W + .5, .03, .2, M.dark); top.position.set(0, .225, z);
    const bot = box(W + .5, .03, .2, M.dark); bot.position.set(0, .015, z);
    skid.add(web, top, bot);
  }
  for (const x of [-W / 2 - .1, W / 2 + .1]) {
    const lug = box(.12, .14, .18, M.dark); lug.position.set(x, .1, D * .32 + .12); skid.add(lug);
  }
  root.add(skid);

  /* tank walls (separate so they can open) */
  const walls = {};
  const mkWall = (name, w, h, d, pos, ribsAlong) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    const mat = M.paint;
    g.add(box(w, h, d, mat));
    // vertical stiffeners
    if (ribsAlong) {
      const n = ribsAlong.n;
      for (let i = 0; i < n; i++) {
        const u = -ribsAlong.len / 2 + (i + .5) * (ribsAlong.len / n);
        const rib = ribsAlong.axis === 'x' ? box(.07, h * .96, .09, mat) : box(.09, h * .96, .07, mat);
        if (ribsAlong.axis === 'x') rib.position.set(u, 0, ribsAlong.out * .07);
        else rib.position.set(ribsAlong.out * .07, 0, u);
        g.add(rib);
      }
    }
    // bottom & top rim bands
    const rimT = box(w + (ribsAlong?.axis === 'z' ? .1 : .02), .07, d + (ribsAlong?.axis === 'x' ? .1 : .02), mat);
    rimT.position.y = h / 2 - .035; g.add(rimT);
    const rimB = rimT.clone(); rimB.position.y = -h / 2 + .035; g.add(rimB);
    walls[name] = g;
    g.userData.home = pos.clone();
    root.add(g);
    return g;
  };
  mkWall('front', W, H, t, new THREE.Vector3(0, yMid, D / 2), { axis: 'x', n: 5, len: W, out: 1 });
  mkWall('back', W, H, t, new THREE.Vector3(0, yMid, -D / 2), { axis: 'x', n: 5, len: W, out: -1 });
  mkWall('left', t, H, D, new THREE.Vector3(-W / 2, yMid, 0), null);
  mkWall('right', t, H, D, new THREE.Vector3(W / 2, yMid, 0), null);
  const floor = box(W, t, D, M.paint); floor.position.y = base; root.add(floor);

  // nameplate + earthing pads + drain valve on front wall
  const plate = box(.42, .28, .01, M.bright); plate.position.set(-.9, .3, t / 2 + .09); walls.front.add(plate);
  const drain = cyl(.07, .07, .16, M.dark, 20); drain.rotation.x = Math.PI / 2; drain.position.set(1.1, -H / 2 + .25, t / 2 + .12); walls.front.add(drain);
  // OLTC compartment on the front-left
  const oltc = box(.7, 1.2, .34, M.paint); oltc.position.set(-1.0, .25, t / 2 + .2); walls.front.add(oltc);
  const oltcDrive = box(.32, .5, .18, M.paint); oltcDrive.position.set(-1.0, -.6, t / 2 + .34); walls.front.add(oltcDrive);

  /* radiator banks on both ends */
  const radiators = [];
  for (const side of [-1, 1]) {
    for (const z of [-.42, .42]) {
      const bank = radiatorBank(13, .56, 1.9, .052, M);
      bank.position.set(side * W / 2, yMid + .05, z);
      bank.rotation.y = side === 1 ? 0 : Math.PI;
      bank.userData.home = bank.position.clone();
      bank.userData.side = side;
      // cooling fans under the right-hand banks (ONAF)
      if (side === 1) {
        const fan = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .025, 10, 36), M.dark);
        ring.rotation.x = Math.PI / 2; fan.add(ring);
        const hub = cyl(.05, .05, .08, M.dark, 16); fan.add(hub);
        for (let b = 0; b < 5; b++) {
          const blade = box(.17, .01, .07, M.dark);
          blade.position.x = .09; blade.rotation.x = .4;
          const piv = new THREE.Group(); piv.rotation.y = (b / 5) * Math.PI * 2; piv.add(blade); fan.add(piv);
        }
        fan.position.set(.48, -1.08, 0);
        bank.add(fan);
      }
      root.add(bank);
      radiators.push(bank);
    }
  }

  /* cover assembly: cover, bushings, conservator, piping */
  const cover = new THREE.Group();
  cover.position.y = base + H;
  cover.userData.home = cover.position.clone();
  const lid = box(W + .14, .07, D + .14, M.paint); lid.position.y = .035; cover.add(lid);
  // bolt ring along the flange (instanced)
  {
    const boltGeo = new THREE.CylinderGeometry(.018, .018, .03, 8);
    const pts = [];
    for (let x = -W / 2; x <= W / 2 + 1e-6; x += .16) { pts.push([x, D / 2 + .04], [x, -D / 2 - .04]); }
    for (let z = -D / 2 + .16; z < D / 2; z += .16) { pts.push([W / 2 + .04, z], [-W / 2 - .04, z]); }
    const bolts = new THREE.InstancedMesh(boltGeo, M.bright, pts.length);
    const m4 = new THREE.Matrix4();
    pts.forEach(([x, z], i) => { m4.makeTranslation(x, .085, z); bolts.setMatrixAt(i, m4); });
    cover.add(bolts);
  }

  const anchors = {};
  const hv = [];
  [-1.05, 0, 1.05].forEach((x, i) => {
    const b = bushing(1.25, .085, 11, M);
    b.position.set(x, .07, .32);
    b.rotation.x = -.06;
    cover.add(b); hv.push(b);
    if (i === 1) {
      const a = new THREE.Object3D(); a.position.set(0, b.userData.top, 0); b.add(a); anchors.bushing = a;
    }
  });
  [-1.2, -.4, .4, 1.2].forEach(x => {
    const b = bushing(.48, .06, 5, M);
    b.position.set(x * .78, .07, -.3);
    cover.add(b);
  });
  // conservator
  const cons = new THREE.Group();
  const drum = cyl(.34, .34, 2.3, M.paint, 48); drum.rotation.z = Math.PI / 2; cons.add(drum);
  for (const s of [-1, 1]) {
    const dish = new THREE.Mesh(new THREE.SphereGeometry(.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.paint);
    dish.scale.y = .25; dish.rotation.z = -s * Math.PI / 2; dish.position.x = s * 1.15; cons.add(dish);
    const leg = box(.08, 1.0, .08, M.dark); leg.position.set(s * .8, -.68, 0); cons.add(leg);
    const brace = box(.08, .08, .5, M.dark); brace.position.set(s * .8, -.25, 0); cons.add(brace);
  }
  const gauge = cyl(.11, .11, .05, M.bright, 24); gauge.rotation.z = Math.PI / 2; gauge.position.x = 1.2; cons.add(gauge);
  cons.position.set(-.1, 1.25, -.62);
  cover.add(cons);
  const ca = new THREE.Object3D(); ca.position.set(1.3, .1, 0); cons.add(ca); anchors.conservator = ca;
  // Buchholz pipe + relay
  const pipe1 = cyl(.05, .05, .9, M.paint, 16); pipe1.position.set(.6, .55, -.62); cover.add(pipe1);
  const relay = box(.2, .16, .16, M.dark); relay.position.set(.6, .42, -.62); cover.add(relay);
  // breather
  const breather = cyl(.07, .07, .3, M.bright, 16); breather.position.set(-1.4, .3, -.62); cover.add(breather);
  // pressure relief
  const prv = cyl(.12, .14, .12, M.dark, 24); prv.position.set(1.25, .13, .0); cover.add(prv);
  root.add(cover);

  /* active part: core + windings */
  const active = new THREE.Group();
  const coreDia = .5, limbH = 1.42, pitchX = 1.06, yokeL = pitchX * 2 + coreDia;
  const coreBase = base + .08;
  const core = new THREE.Group();
  const limbs = [];
  [-pitchX, 0, pitchX].forEach(x => {
    const l = steppedBar(limbH, coreDia, M, 'y');
    l.position.set(x, coreBase + coreDia + limbH / 2, 0);
    core.add(l); limbs.push(l);
  });
  const yokeB = steppedBar(yokeL, coreDia, M, 'x');
  yokeB.position.y = coreBase + coreDia / 2;
  core.add(yokeB);
  const yokeT = steppedBar(yokeL, coreDia, M, 'x');
  yokeT.position.y = coreBase + coreDia * 1.5 + limbH;
  yokeT.userData.home = yokeT.position.clone();
  core.add(yokeT);
  // clamping frames
  const frames = new THREE.Group();
  for (const y of [yokeB.position.y, yokeT.position.y]) {
    for (const z of [-1, 1]) {
      const f = box(yokeL + .1, coreDia * .9, .05, M.paint);
      f.position.set(0, y, z * (coreDia * .5 + .05));
      frames.add(f);
    }
  }
  const coreAnchor = new THREE.Object3D(); coreAnchor.position.set(-pitchX, coreBase + coreDia + limbH * .55, coreDia * .5);
  core.add(coreAnchor); anchors.core = coreAnchor;
  active.add(core, frames);

  const windings = [];
  const hvCoils = [];
  limbs.forEach((l, i) => {
    const g = new THREE.Group();
    g.position.set(l.position.x, l.position.y, 0);
    const lvTex = M.copper.clone();
    lvTex.map = M.copper.map.clone(); lvTex.map.needsUpdate = true; lvTex.map.repeat.set(3, 2.4);
    const lv = hollowCyl(coreDia * .56, coreDia * .7, limbH * .9, lvTex);
    const hvM = M.copper.clone();
    hvM.map = M.copper.map.clone(); hvM.map.needsUpdate = true; hvM.map.repeat.set(4, 3.2);
    const hvc = hollowCyl(coreDia * .8, coreDia * 1.0, limbH * .94, hvM);
    const barrier = hollowCyl(coreDia * .72, coreDia * .76, limbH * .98, M.pressboard);
    g.add(lv, barrier);
    const hvGroup = new THREE.Group(); hvGroup.add(hvc);
    for (const s of [-1, 1]) {
      const ring = hollowCyl(coreDia * .54, coreDia * 1.04, .06, M.pressboard);
      ring.position.y = s * (limbH * .49);
      hvGroup.add(ring);
    }
    // lead out of HV top
    const lead = cyl(.02, .02, .4, M.copperPlain, 8); lead.position.set(0, limbH * .5 + .2, coreDia * .9); hvGroup.add(lead);
    g.add(hvGroup);
    hvCoils.push(hvGroup);
    g.userData.home = g.position.clone();
    active.add(g); windings.push(g);
    if (i === 2) {
      const a = new THREE.Object3D(); a.position.set(coreDia * .7, limbH * .15, coreDia * .7); g.add(a); anchors.winding = a;
    }
  });
  root.add(active);

  /* named anchors for annotations */
  const ra = new THREE.Object3D(); ra.position.set(.6, .3, 0); radiators[3].add(ra); anchors.radiator = ra;
  const ta = new THREE.Object3D(); ta.position.set(1.2, .35, .06); walls.front.add(ta); anchors.tank = ta;
  const cva = new THREE.Object3D(); cva.position.set(-W / 2 + .3, .07, D / 2); cover.add(cva); anchors.cover = cva;

  shadowAll(root);

  /* optional ghost lines for the paper "drawing" look when the tank opens */
  let lines = null;
  if (ghostLines) {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0d0c0a, transparent: true, opacity: 0 });
    lines = new THREE.Group();
    for (const [name, w] of Object.entries(walls)) {
      const geo = new THREE.EdgesGeometry(w.children[0].geometry);
      const seg = new THREE.LineSegments(geo, lineMat);
      seg.position.copy(w.position);
      seg.userData.wall = name;
      lines.add(seg);
    }
    const lidEdges = new THREE.LineSegments(new THREE.EdgesGeometry(lid.geometry), lineMat);
    lidEdges.position.y = base + H + .035; lines.add(lidEdges);
    lines.userData.mat = lineMat;
    root.add(lines);
  }

  return {
    root, M, walls, radiators, cover, core, yokeT, windings, hvCoils, active, anchors, lines,
    dims: { W, D, H, base },
  };
}
