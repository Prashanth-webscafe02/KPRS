// Stage 01 schematic: a three-limb core in elevation and a section through a
// step-lap joint. Drawn only from what the process page states (CRGO
// laminations, mitred, step-lap, clamping frame, tie rods); no dimensions,
// sheet counts or step numbers are implied. Three limbs, as in the KPRS
// core–coil photographs.

const KEY = [
  ['1', 'Limb'],
  ['2', 'Yoke'],
  ['3', 'Mitred joint'],
  ['4', 'Clamping frame'],
  ['5', 'Tie rod'],
] as const;

// section through the stack at a joint: each sheet breaks a step further along
const SHEETS = Array.from({ length: 7 }, (_, i) => i);

export default function CoreSchematic() {
  return (
    <figure className="mf-schem" data-reveal>
      <svg viewBox="0 0 720 400" role="img" aria-labelledby="mf-schem-t">
        <title id="mf-schem-t">Schematic of a three-limb transformer core with mitred, step-lap joints, a clamping frame and tie rods</title>
        <defs>
          <clipPath id="mf-schem-clip"><circle cx="578" cy="206" r="118" /></clipPath>
          <pattern id="mf-schem-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" className="s-thin" />
          </pattern>
        </defs>

        {/* core: outer outline and the two windows */}
        <path className="s-core" d="M40 64H420V352H40Z M96 120H202V296H96Z M258 120H364V296H258Z" fillRule="evenodd" />
        {/* mitred corners and the centre-limb T joints */}
        <path className="s-ln" d="M40 64L96 120 M420 64L364 120 M40 352L96 296 M420 352L364 296" />
        <path className="s-ln" d="M202 120L230 92L258 120 M230 92V64 M202 296L230 324L258 296 M230 324V352" />
        {/* clamping frame, top and bottom, and the vertical tie rods */}
        <rect className="s-frame" x="22" y="44" width="416" height="26" />
        <rect className="s-frame" x="22" y="346" width="416" height="26" />
        <path className="s-ln" d="M30 70V346 M430 70V346" />
        <path className="s-thin" d="M24 70h12 M24 346h12 M424 70h12 M424 346h12" />
        <path className="s-cl" d="M68 30V388 M230 30V388 M392 30V388" />

        {/* detail A: where it is taken, and the enlarged section */}
        <circle className="s-acc" cx="68" cy="92" r="24" />
        <path className="s-acc" d="M86 76C200 8 410 8 478 124" />
        <circle className="s-acc" cx="578" cy="206" r="118" />
        <g clipPath="url(#mf-schem-clip)">
          {SHEETS.map(i => {
            const y = 150 + i * 16, j = 506 + (i % 7) * 22;
            return (
              <g key={i}>
                <rect className="s-sheet" x="440" y={y} width={j - 440} height="11" />
                <rect className="s-sheet" x={j + 6} y={y} width={720 - j} height="11" />
              </g>
            );
          })}
          <path className="s-acc" d="M498 147.5L652 259.5" strokeDasharray="4 4" />
        </g>
        <text x="578" y="352" textAnchor="middle" className="s-tag">A</text>
        <text x="68" y="132" textAnchor="middle" className="s-tag">A</text>

        {/* numbered callouts, keyed in the caption */}
        {[[230, 208, '1'], [149, 92, '2'], [112, 136, '3'], [330, 57, '4'], [30, 208, '5']].map(([x, y, n]) => (
          <g key={n as string} className="s-call">
            <circle cx={x} cy={y} r="11" />
            <text x={x} y={(y as number) + 4} textAnchor="middle">{n}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        <ol className="mf-schem__key">
          {KEY.map(([n, k]) => <li key={n}><span>{n}</span>{k}</li>)}
          <li><span>A</span>Section through a joint: each sheet breaks a step further along, so neighbouring sheets never break in the same place</li>
        </ol>
        <p className="mf-schem__note">Schematic, not to scale.</p>
      </figcaption>
    </figure>
  );
}
