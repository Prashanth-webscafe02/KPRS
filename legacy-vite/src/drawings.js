// Elevation drawings for the product plates, generated as SVG.
// Every element is a real stroke so the drawing can be "plotted" on scroll.

const PL = ' pathLength="1"';
const R = (x, y, w, h, c = 'ln', rx = 0) => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''}${PL}/>`;
const L = (x1, y1, x2, y2, c = 'ln') => `<line class="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${PL}/>`;
const P = (d, c = 'ln') => `<path class="${c}" d="${d}"${PL}/>`;
const C = (cx, cy, r, c = 'ln') => `<circle class="${c}" cx="${cx}" cy="${cy}" r="${r}"${PL}/>`;
const TX = (x, y, s, anchor = 'middle', rot = 0, c = '') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}${c ? ` class="${c}"` : ''}>${s}</text>`;

function dimH(x1, x2, y, label, ext = 0) {
  const a = 5;
  return [
    ext ? L(x1, y - 6, x1, y + ext, 'ln-dim') + L(x2, y - 6, x2, y + ext, 'ln-dim') : '',
    L(x1, y, x2, y, 'ln-dim'),
    P(`M${x1 + a * 1.6},${y - a * .6} L${x1},${y} L${x1 + a * 1.6},${y + a * .6}`, 'ln-dim'),
    P(`M${x2 - a * 1.6},${y - a * .6} L${x2},${y} L${x2 - a * 1.6},${y + a * .6}`, 'ln-dim'),
    TX((x1 + x2) / 2, y - 8, label),
  ].join('');
}
function dimV(x, y1, y2, label, ext = 0) {
  const a = 5;
  return [
    ext ? L(x - ext, y1, x + 6, y1, 'ln-dim') + L(x - ext, y2, x + 6, y2, 'ln-dim') : '',
    L(x, y1, x, y2, 'ln-dim'),
    P(`M${x - a * .6},${y1 + a * 1.6} L${x},${y1} L${x + a * .6},${y1 + a * 1.6}`, 'ln-dim'),
    P(`M${x - a * .6},${y2 - a * 1.6} L${x},${y2} L${x + a * .6},${y2 - a * 1.6}`, 'ln-dim'),
    TX(x - 9, (y1 + y2) / 2, label, 'middle', -90),
  ].join('');
}

// Radiator bank seen face-on: a frame with n fin edges
function finBank(x, y, w, h, n) {
  let s = R(x, y, w, h);
  for (let i = 1; i < n; i++) { const fx = x + (w / n) * i; s += L(fx, y + 4, fx, y + h - 4, 'ln-thin'); }
  s += R(x - 3, y - 6, w + 6, 6, 'ln-thin') + R(x - 3, y + h, w + 6, 6, 'ln-thin');
  return s;
}

// Porcelain bushing in elevation
function bushing(cx, baseY, h, r, sheds) {
  let s = R(cx - r * 1.6, baseY - 6, r * 3.2, 6);
  const pitch = (h - 16) / sheds;
  let d = `M${cx - r},${baseY - 6}`;
  for (let i = 0; i < sheds; i++) {
    const y = baseY - 6 - i * pitch;
    const rr = i % 2 ? r * 1.6 : r * 2;
    d += ` L${cx - r},${y - pitch * .2} L${cx - rr},${y - pitch * .45} L${cx - rr},${y - pitch * .6} L${cx - r},${y - pitch * .85}`;
  }
  const topY = baseY - 6 - sheds * pitch;
  d += ` L${cx - r * .8},${topY}`;
  let d2 = `M${cx + r},${baseY - 6}`;
  for (let i = 0; i < sheds; i++) {
    const y = baseY - 6 - i * pitch;
    const rr = i % 2 ? r * 1.6 : r * 2;
    d2 += ` L${cx + r},${y - pitch * .2} L${cx + rr},${y - pitch * .45} L${cx + rr},${y - pitch * .6} L${cx + r},${y - pitch * .85}`;
  }
  d2 += ` L${cx + r * .8},${topY}`;
  s += P(d) + P(d2);
  s += R(cx - r * .9, topY - 10, r * 1.8, 10) + L(cx, topY - 10, cx, topY - 18);
  return s;
}

function ground(x1, x2, y) {
  let s = L(x1, y, x2, y, 'ln-dim');
  for (let x = x1; x < x2; x += 9) s += L(x, y + 1, x - 6, y + 7, 'ln-thin');
  return s;
}

const svgWrap = (vb, body, title) =>
  `<svg viewBox="${vb}" role="img" aria-label="${title}" preserveAspectRatio="xMidYMax meet">${body}</svg>`;

/* ----------------------------------------------------------------- plates */

const drawings = {
  distribution() {
    const g = 470, x = 190, w = 230, h = 210, y = g - 30 - h;
    let s = ground(60, 560, g);
    // wheels / base channel
    s += R(x - 10, g - 30, w + 20, 14) + C(x + 30, g - 8, 8) + C(x + w - 30, g - 8, 8);
    // corrugated tank: tight vertical folds
    s += R(x, y, w, h);
    for (let i = 1; i < 26; i++) { const fx = x + (w / 26) * i; s += L(fx, y + 14, fx, y + h - 10, 'ln-thin'); }
    s += R(x - 6, y - 10, w + 12, 10);
    // HV bushings
    [x + 55, x + 115, x + 175].forEach(cx => { s += bushing(cx, y - 10, 92, 7, 6); });
    // LV bushings on the side
    [y + 40, y + 80].forEach(by => { s += R(x + w, by, 22, 10, 'ln-thin') + R(x + w + 22, by - 3, 10, 16); });
    // nameplate + centreline
    s += R(x + 18, y + 60, 34, 24, 'ln-thin');
    s += L(x + w / 2, y - 140, x + w / 2, g + 16, 'ln-cl');
    s += dimH(x - 10, x + w + 32, g + 34, '1 450', 0);
    s += dimV(x - 40, y - 112, g - 30, '1 620', 8);
    s += TX(x + w / 2, y - 154, 'ELEVATION A–A', 'middle', 0, 't-big');
    return svgWrap('0 0 600 520', s, 'Elevation of an oil-immersed distribution transformer');
  },

  power() {
    const g = 480, x = 170, w = 260, h = 190, y = g - 24 - h;
    let s = ground(30, 580, g);
    s += R(x - 20, g - 24, w + 40, 12) + R(x - 20, g - 12, w + 40, 12, 'ln-thin');
    s += R(x, y, w, h);
    for (let i = 1; i < 6; i++) { const fx = x + (w / 6) * i; s += R(fx - 3, y + 8, 6, h - 16, 'ln-thin'); }
    // radiator banks either side
    s += finBank(x - 92, y + 10, 72, h - 24, 14) + L(x - 20, y + 20, x, y + 20) + L(x - 20, y + h - 22, x, y + h - 22);
    s += finBank(x + w + 20, y + 10, 72, h - 24, 14) + L(x + w, y + 20, x + w + 20, y + 20) + L(x + w, y + h - 22, x + w + 20, y + h - 22);
    // fans under right bank
    s += C(x + w + 56, y + h + 2, 14, 'ln-thin');
    // cover + HV + LV bushings
    s += R(x - 6, y - 8, w + 12, 8);
    [x + 60, x + 130, x + 200].forEach(cx => { s += bushing(cx, y - 8, 150, 8, 10); });
    [x + 95, x + 165].forEach(cx => { s += bushing(cx, y - 8, 56, 6, 4); });
    // conservator on legs
    const cy = y - 120;
    s += R(x + 10, cy - 22, w - 20, 44, 'ln', 22);
    s += L(x + 40, cy + 22, x + 40, y - 8) + L(x + w - 40, cy + 22, x + w - 40, y - 8);
    s += C(x + w - 4, cy, 7, 'ln-thin');
    // OLTC
    s += R(x + 18, y + 40, 50, 90) + R(x + 28, y + 140, 30, 30, 'ln-thin');
    s += L(x + w / 2, cy - 90, x + w / 2, g + 16, 'ln-cl');
    s += dimH(x - 92, x + w + 92, g + 34, '6 200', 0);
    s += dimV(x - 120, y - 166, g - 24, '5 400', 10);
    s += TX(x + w / 2, cy - 104, 'FRONT ELEVATION', 'middle', 0, 't-big');
    return svgWrap('0 0 600 520', s, 'Front elevation of a power transformer with radiators, bushings and conservator');
  },

  dry() {
    const g = 470, x = 140, w = 320;
    let s = ground(40, 560, g);
    // base with rollers
    s += R(x - 10, g - 34, w + 20, 18) + C(x + 26, g - 9, 8) + C(x + w - 26, g - 9, 8);
    // clamping frame
    s += R(x, g - 300, w, 16) + R(x, g - 50, w, 16);
    s += L(x + 8, g - 284, x + 8, g - 50, 'ln-thin') + L(x + w - 8, g - 284, x + w - 8, g - 50, 'ln-thin');
    // three cast-resin coils
    const cw = 84, ch = 220, cy = g - 276;
    [0, 1, 2].forEach(i => {
      const cx = x + 22 + i * (cw + 20);
      s += R(cx, cy, cw, ch, 'ln', 10);
      for (let k = 1; k < 9; k++) s += L(cx + 6, cy + (ch / 9) * k, cx + cw - 6, cy + (ch / 9) * k, 'ln-thin');
      s += R(cx + cw / 2 - 6, cy - 26, 12, 26, 'ln-thin');
    });
    // delta bars
    s += P(`M${x + 64},${g - 302} L${x + 64},${g - 330} L${x + 256},${g - 330} L${x + 256},${g - 302}`);
    s += L(x + 168, g - 330, x + 168, g - 302);
    // enclosure outline (IP31) — dashed
    s += `<rect class="ln-cl" x="${x - 34}" y="${g - 360}" width="${w + 68}" height="326" />`;
    s += L(x + w / 2, g - 390, x + w / 2, g + 16, 'ln-cl');
    s += dimH(x - 34, x + w + 34, g + 34, '1 900', 0);
    s += dimV(x - 60, g - 360, g - 34, '2 150', 8);
    s += TX(x + w / 2, g - 374, 'ELEVATION · ENCLOSURE DASHED', 'middle', 0, 't-big');
    return svgWrap('0 0 600 520', s, 'Elevation of a cast-resin dry-type transformer');
  },

  furnace() {
    const g = 470, x = 150, w = 230, h = 220, y = g - 26 - h;
    let s = ground(30, 580, g);
    s += R(x - 14, g - 26, w + 28, 14) + R(x - 14, g - 12, w + 28, 12, 'ln-thin');
    s += R(x, y, w, h);
    for (let i = 1; i < 5; i++) { const fy = y + (h / 5) * i; s += L(x + 6, fy, x + w - 6, fy, 'ln-thin'); }
    s += R(x - 6, y - 8, w + 12, 8);
    // HV bushings
    [x + 50, x + 115, x + 180].forEach(cx => { s += bushing(cx, y - 8, 110, 7, 7); });
    // heavy secondary busbars out of the side
    [0, 1, 2, 3, 4, 5].forEach(i => {
      const by = y + 26 + i * 30;
      s += R(x + w, by, 74, 12) + R(x + w + 74, by - 4, 14, 20, 'ln-thin');
    });
    s += TX(x + w + 46, y + 14, 'LV BUS · 60 kA', 'middle');
    // OFWF water cooler + pipework on the left
    s += R(x - 104, y + 40, 68, 130) + C(x - 70, y + 70, 16, 'ln-thin') + C(x - 70, y + 140, 16, 'ln-thin');
    s += P(`M${x - 36},${y + 60} L${x},${y + 60}`) + P(`M${x - 36},${y + 150} L${x},${y + 150}`);
    s += L(x - 104, y + 180, x - 36, y + 180, 'ln-thin');
    s += L(x + w / 2, y - 140, x + w / 2, g + 16, 'ln-cl');
    s += dimH(x - 104, x + w + 88, g + 34, '4 600', 0);
    s += dimV(x - 130, y - 126, g - 26, '3 900', 8);
    s += TX(x + w / 2, y - 150, 'ELEVATION · OFWF', 'middle', 0, 't-big');
    return svgWrap('0 0 600 520', s, 'Elevation of a furnace-duty transformer with heavy secondary busbars');
  },

  solar() {
    const g = 470, x = 190, w = 220, h = 200, y = g - 24 - h;
    let s = ground(40, 570, g);
    s += R(x - 14, g - 24, w + 28, 12) + R(x - 14, g - 12, w + 28, 12, 'ln-thin');
    s += R(x, y, w, h);
    s += finBank(x - 72, y + 12, 56, h - 30, 11) + L(x - 16, y + 24, x, y + 24) + L(x - 16, y + h - 24, x, y + h - 24);
    s += finBank(x + w + 16, y + 12, 56, h - 30, 11) + L(x + w, y + 24, x + w + 16, y + 24) + L(x + w, y + h - 24, x + w + 16, y + h - 24);
    s += R(x - 6, y - 8, w + 12, 8);
    [x + 45, x + 110, x + 175].forEach(cx => { s += bushing(cx, y - 8, 120, 7, 8); });
    // duplex LV: two groups of bushings on a side box
    s += R(x + 28, y + 30, 70, 60, 'ln-thin') + R(x + 122, y + 30, 70, 60, 'ln-thin');
    [x + 40, x + 63, x + 86, x + 134, x + 157, x + 180].forEach(cx => { s += C(cx, y + 60, 7, 'ln-thin'); });
    s += TX(x + 63, y + 110, 'LV1') + TX(x + 157, y + 110, 'LV2');
    s += L(x + w / 2, y - 150, x + w / 2, g + 16, 'ln-cl');
    s += dimH(x - 72, x + w + 72, g + 34, '3 800', 0);
    s += dimV(x - 100, y - 138, g - 24, '3 300', 8);
    s += TX(x + w / 2, y - 158, 'ELEVATION · DUPLEX LV', 'middle', 0, 't-big');
    return svgWrap('0 0 600 520', s, 'Elevation of an inverter-duty transformer with two LV windings');
  },
};

export function renderDrawings() {
  document.querySelectorAll('[data-drawing]').forEach(fig => {
    const fn = drawings[fig.dataset.drawing];
    if (fn) fig.innerHTML = fn();
  });
}
