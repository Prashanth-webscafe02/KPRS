import { sheets } from '@/content/site';

/** Title-block header, right-edge scale gauge and the drawing-register overlay.
 *  Behaviour (sheet roll, gauge, register open/close) is wired in lib/animations/chrome.ts. */
export default function Navigation() {
  return (
    <>
      {/* ───────────── Title-block navigation ───────────── */}
      <header className="tb" data-tb>
        <a className="tb__mark" href="#top" aria-label="KPRS — home">
          <span className="tb__kprs">KPRS</span>
          <span className="tb__sub">Transformers</span>
        </a>
        <div className="tb__sheet" aria-live="polite">
          <span className="tb__label">SHT</span>
          <span className="tb__num" data-sheet-num>01</span>
          <span className="tb__slash">/07</span>
          <span className="tb__title" data-sheet-title>Reveal</span>
        </div>
        <nav className="tb__actions">
          <button className="tb__index" data-index-open aria-expanded="false" aria-controls="register">
            <span className="tb__bars" aria-hidden="true"><i></i><i></i></span>Index
          </button>
          <a className="tb__enquire" href="#enquire">Request a specification</a>
        </nav>
      </header>

      {/* Vertical scale gauge (desktop) */}
      <div className="gauge" aria-hidden="true">
        <div className="gauge__ticks" data-gauge-ticks></div>
        <div className="gauge__needle" data-gauge-needle></div>
        <span className="gauge__read" data-gauge-read>000</span>
      </div>

      {/* Drawing register (index overlay) */}
      <div className="register" id="register" data-register aria-hidden="true">
        <div className="register__inner">
          <div className="register__head">
            <span>Drawing register</span><span>KPRS / WEB / REV C</span>
            <button className="register__close" data-index-close>Close</button>
          </div>
          <table className="register__table">
            <thead><tr><th>Sht</th><th>Title</th><th>Content</th><th>Rev</th></tr></thead>
            <tbody>
              {sheets.map(s => (
                <tr key={s.no}><td>{s.no}</td><td><a href={`#${s.id}`}>{s.title}</a></td><td>{s.content}</td><td>C</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
