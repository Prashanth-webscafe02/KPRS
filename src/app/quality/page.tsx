import type { Metadata } from 'next';
import Link from 'next/link';
import PageMotion from '@/components/site/PageMotion';
import { approvals, qualityPolicy, standards, testEquipment } from '@/content/company';

export const metadata: Metadata = {
  title: 'Quality & testing',
  description:
    'Every KPRS transformer is routine-tested to IS 2026 and IS 1180, with a test report for the customer. BIS licence, BEE star rating, ISO 9001, and BESCOM, MESCOM and CHESCOM approvals.',
  alternates: { canonical: '/quality' },
};

export default function QualityPage() {
  return (
    <main id="content" className="pg pg-quality">
      <section className="ql-hero" data-tone="paper">
        <p className="kicker" data-reveal>Quality &amp; testing</p>
        <h1 className="ql-hero__title" data-reveal="lines">
          <span className="ln"><span>Every unit tested.</span></span>
          <span className="ln"><span><em>Every result reported.</em></span></span>
        </h1>
        <div className="ql-hero__figure" data-reveal>
          <span className="ql-hero__big">100<small>%</small></span>
          <p>of transformers are routine-tested to IS 2026 and IS 1180 before dispatch. The test report and certificate for each unit go to the customer.</p>
        </div>
      </section>

      <section className="ql-approvals" data-tone="dark" aria-labelledby="appr-h">
        <h2 id="appr-h" className="h2" data-reveal>Licences &amp; approvals</h2>
        <ul className="ql-approvals__list" data-reveal="stagger">
          {approvals.map(a => <li key={a.name}><strong>{a.name}</strong><span>{a.body}</span></li>)}
        </ul>
      </section>

      <section className="ql-standards" data-tone="paper" aria-labelledby="std-h">
        <div className="ql-standards__head">
          <h2 id="std-h" className="h2" data-reveal>Standards we build to</h2>
          <p data-reveal>Energy-efficient distribution transformers are built to the levels recommended by BEE, as set out in IS 1180.</p>
        </div>
        <table className="ql-table" data-reveal>
          <caption className="sr-only">Reference standards</caption>
          <thead><tr><th scope="col">Standard</th><th scope="col">Applies to</th></tr></thead>
          <tbody>{standards.map(s => <tr key={s.code}><th scope="row">{s.code}</th><td>{s.scope}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="ql-bay" data-tone="paper" aria-labelledby="bay-h">
        <div className="ql-bay__head">
          <h2 id="bay-h" className="h2" data-reveal>In the test bay</h2>
          <p data-reveal>Instruments used for routine testing and inspection at the works.</p>
        </div>
        <ul className="ql-bay__list" data-reveal="stagger">
          {testEquipment.map((t, i) => (
            <li key={t.name}>
              <span className="ql-bay__no">T{String(i + 1).padStart(2, '0')}</span>
              <strong>{t.name}</strong>
              {t.detail && <span className="ql-bay__detail">{t.detail}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="ql-policy" data-tone="dark" aria-labelledby="pol-h">
        <div className="ql-policy__head">
          <p className="kicker" data-reveal>Quality policy</p>
          <h2 id="pol-h" className="h2" data-reveal>What every order is held to</h2>
        </div>
        <ol className="ql-policy__list">
          {qualityPolicy.map((q, i) => <li key={i} data-reveal><span>{String(i + 1).padStart(2, '0')}</span>{q}</li>)}
        </ol>
      </section>

      <section className="cta-band cta-band--paper" data-tone="paper">
        <h2 className="cta-band__title" data-reveal>Need test reports or certificates for a tender?</h2>
        <div className="cta-band__actions" data-reveal>
          <Link href="/contact" className="btn btn--accent btn--lg">Request documents</Link>
          <Link href="/manufacturing#stage-06" className="link-arrow">Testing in the process <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <PageMotion />
    </main>
  );
}
