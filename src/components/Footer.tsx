import { Fragment } from 'react';
import { contact } from '@/content/site';
import Contact from './Contact';

/** SHT 07 · Drawing title-block footer. One <footer> element, as in the original. */
export default function Footer() {
  return (
    <footer className="enquire" id="enquire" data-sheet="07" data-sheet-title="Enquire" data-tone="paper">
      <Contact />

      <div className="titleblock">
        <div className="titleblock__cell titleblock__cell--logo">
          <span className="titleblock__k">KPRS</span>
          <span className="mono">Transformers &amp; electrical engineering</span>
        </div>
        <div className="titleblock__cell"><span className="mono">Works</span><p>{contact.works.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{l}</Fragment>)}</p></div>
        <div className="titleblock__cell"><span className="mono">Telephone</span><p>{contact.phones.map((ph, i) => <Fragment key={ph.href}>{i > 0 && <br />}<a href={ph.href}>{ph.label}</a></Fragment>)}</p></div>
        <div className="titleblock__cell"><span className="mono">Standards</span><p>IS 2026 · IS 1180<br />IEC 60076</p></div>
        <div className="titleblock__cell"><span className="mono">Sheets</span><p><a href="#anatomy">Anatomy</a> · <a href="#range">Range</a><br /><a href="#record">Test record</a></p></div>
        <div className="titleblock__cell titleblock__cell--small"><span className="mono">Scale</span><p>1 : 1</p></div>
        <div className="titleblock__cell titleblock__cell--small"><span className="mono">Rev</span><p>C</p></div>
        <div className="titleblock__cell titleblock__cell--small"><span className="mono">Sheet</span><p>07 / 07</p></div>
        <div className="titleblock__cell titleblock__cell--wide"><span className="mono">©</span><p>KPRS <span data-year>2026</span>. All dimensions in millimetres unless stated.</p></div>
      </div>
    </footer>
  );
}
