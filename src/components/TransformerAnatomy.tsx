import { anatomy } from '@/content/site';

/** 03 · Scroll-controlled anatomy. The canvas is inserted after the grid on the client. */
export default function TransformerAnatomy() {
  return (
    <section className="anatomy" id="anatomy" data-tone="paper">
      <div className="anatomy__pin" data-anatomy-pin>
        <div className="anatomy__grid" aria-hidden="true"></div>
        <svg className="anatomy__leaders" data-anatomy-leaders aria-hidden="true"></svg>

        <header className="anatomy__head">
          <p className="kicker"><span>03</span>{anatomy.kicker}</p>
          <h2 className="anatomy__title">Anatomy of <em>a power transformer</em></h2>
        </header>

        <ol className="anatomy__steps" data-anatomy-steps>
          {anatomy.steps.map((s, i) => (
            <li key={s.no} className={i === 0 ? 'is-active' : undefined}>
              <span className="anatomy__no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="anatomy__label" data-label-anchor={s.anchor}>{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="anatomy__scale" aria-hidden="true">
          <div className="anatomy__scale-bar"><span data-anatomy-progress></span></div>
          <div className="anatomy__scale-marks">
            {anatomy.steps.map(s => <span key={s.no}>{s.no}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
