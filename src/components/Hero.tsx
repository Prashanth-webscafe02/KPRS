import { hero } from '@/content/site';

/** SHT 01 · Cinematic reveal. The WebGL canvas is created on the client
 *  (see MotionController) so a Strict Mode remount never reuses a lost context. */
export default function Hero() {
  return (
    <section className="hero" id="top" data-sheet="01" data-sheet-title="Reveal" data-tone="dark">
      <div className="hero__veil" aria-hidden="true"></div>

      <div className="hero__frame" aria-hidden="true">
        <span className="crop crop--tl"></span><span className="crop crop--tr"></span>
        <span className="crop crop--bl"></span><span className="crop crop--br"></span>
      </div>

      {/* leader-line annotations, positioned from 3D anchors */}
      <svg className="hero__leaders" data-hero-leaders aria-hidden="true"></svg>
      <ul className="hero__notes" aria-hidden="true">
        {hero.notes.map(n => (
          <li key={n.anchor} data-anchor={n.anchor}><b>{n.letter}</b>{n.name}<em>{n.detail}</em></li>
        ))}
      </ul>

      <div className="hero__copy">
        <p className="hero__eyebrow"><span>Power</span><span>·</span><span>Distribution</span><span>·</span><span>Special duty</span></p>
        <h1 className="hero__title">
          <span className="line"><span>Power, held</span></span>
          <span className="line"><span><em>in precise</em></span></span>
          <span className="line"><span>tension.</span></span>
        </h1>
      </div>

      <div className="hero__meta">
        <dl>
          {hero.meta.map(m => (
            <div key={m.term}>
              <dt>{m.term}</dt>
              {m.count !== undefined
                ? <dd data-hero-count={m.count} data-suffix={m.suffix}>{m.value}</dd>
                : <dd>{m.value}</dd>}
            </div>
          ))}
        </dl>
        <p className="hero__scroll"><span className="hero__scroll-line"></span>Scroll to open the tank</p>
      </div>
    </section>
  );
}
