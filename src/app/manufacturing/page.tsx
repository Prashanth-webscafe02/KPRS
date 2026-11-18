import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageMotion from '@/components/site/PageMotion';
import CoreSchematic from '@/components/site/CoreSchematic';
import { process } from '@/content/company';

// hero: the active part, the stage where core and windings become one machine
const heroStage = process.find(s => s.no === '03')!;
const heroPhoto = heroStage.photos.find(ph => !ph.studio)!;

export const metadata: Metadata = {
  title: 'Manufacturing process',
  description:
    'How KPRS builds a transformer: CRGO step-lap core, copper or aluminium windings, core–coil assembly, air or vacuum drying, tanking, 100 % routine testing to IS 2026 and IS 1180, painting and dispatch.',
  alternates: { canonical: '/manufacturing' },
};

export default function ManufacturingPage() {
  return (
    <main id="content" className="pg pg-mfg">
      <section className="mf-hero" data-tone="dark">
        <div className="mf-hero__text">
          <p className="kicker" data-reveal>Manufacturing</p>
          <h1 className="mf-hero__title" data-reveal="lines">
            <span className="ln"><span>From core steel</span></span>
            <span className="ln"><span>to dispatch,</span></span>
            <span className="ln"><span><em>under one roof.</em></span></span>
          </h1>
          <p className="mf-hero__lede" data-reveal>Seven stages, every one of them carried out in the Bommasandra works. Each assembly is checked by stage inspection before it moves on.</p>
          <dl className="mf-hero__facts" data-reveal="stagger">
            <div><dt>Stages</dt><dd>{String(process.length).padStart(2, '0')}</dd></div>
            <div><dt>Works</dt><dd>Bommasandra, Bangalore</dd></div>
            <div><dt>Routine testing</dt><dd>100 % · IS 2026 / IS 1180</dd></div>
          </dl>
        </div>
        <figure className="mf-hero__photo" data-reveal="image">
          <Image src={heroPhoto.src} alt={heroPhoto.alt} placeholder="blur" priority sizes="(max-width: 860px) 100vw, 42vw" />
          <figcaption><span>{heroStage.no}</span>{heroStage.title} — {heroPhoto.alt.replace(/^Core–coil assembly, /, '')}</figcaption>
        </figure>
      </section>

      {/* the line: sticky stage index on desktop, swipeable chips on phones */}
      <nav className="mf-line" aria-label="Process stages" data-tone="dark">
        <ol>
          {process.map(s => (
            <li key={s.no}><a href={`#stage-${s.no}`}><span>{s.no}</span>{s.title}</a></li>
          ))}
        </ol>
      </nav>

      <div className="mf-stages">
        {process.map(s => (
          <section key={s.no} id={`stage-${s.no}`} className="mf-stage" data-tone="paper" aria-labelledby={`stage-${s.no}-h`}>
            <header className="mf-stage__head">
              <span className="mf-stage__no" aria-hidden="true">{s.no}</span>
              <div>
                <h2 id={`stage-${s.no}-h`} className="mf-stage__title" data-reveal>{s.title}</h2>
                <p className="mf-stage__sum" data-reveal>{s.summary}</p>
              </div>
            </header>
            <div className="mf-stage__body" data-reveal="stagger">
              {s.body.map((b, i) => <p key={i}>{b}</p>)}
            </div>
            {s.photos.length > 0 && (
              <div className={`mf-stage__photos mf-stage__photos--${Math.min(s.photos.length, 3)}`}>
                {s.photos.map(ph => (
                  <figure key={ph.src.src} className={ph.studio ? 'is-studio' : undefined} data-reveal="image">
                    <Image src={ph.src} alt={ph.alt} placeholder="blur" sizes="(max-width: 860px) 92vw, 40vw" />
                    <figcaption>{ph.alt}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {s.no === '01' && <CoreSchematic />}
          </section>
        ))}
      </div>

      <section className="cta-band" data-tone="dark">
        <h2 className="cta-band__title" data-reveal>The machines and test equipment behind each stage.</h2>
        <div className="cta-band__actions" data-reveal>
          <Link href="/infrastructure" className="btn btn--accent btn--lg">Infrastructure</Link>
          <Link href="/quality" className="btn btn--ghost btn--lg">Quality &amp; testing</Link>
        </div>
      </section>
      <PageMotion />
    </main>
  );
}
