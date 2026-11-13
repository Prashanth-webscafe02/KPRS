import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageMotion from '@/components/site/PageMotion';
import { company, infrastructure, testEquipment } from '@/content/company';
import hero from '@/assets/kprs/process-winding.jpg';

export const metadata: Metadata = {
  title: 'Infrastructure & facility',
  description:
    'The KPRS works in Bommasandra Industrial Area, Bangalore: in-house design software, HV and LV winding machines, vacuum drying oven, EOT cranes, painting booth and a test bay with 70 kV and 170 kV HV test transformers.',
  alternates: { canonical: '/infrastructure' },
};

export default function InfrastructurePage() {
  const [p1, p2, p3, p4] = infrastructure.photos;
  return (
    <main id="content" className="pg pg-infra">
      <section className="if-hero" data-tone="dark">
        <div className="if-hero__img" aria-hidden="true">
          <Image src={hero} alt="" placeholder="blur" priority fill sizes="100vw" data-parallax="6" />
        </div>
        <div className="if-hero__text">
          <p className="kicker" data-reveal>Infrastructure &amp; facility</p>
          <h1 className="if-hero__title" data-reveal="lines">
            <span className="ln"><span>The works at</span></span>
            <span className="ln"><span><em>Bommasandra.</em></span></span>
          </h1>
          <p className="if-hero__lede" data-reveal>{infrastructure.location}. Every assembly and sub-assembly is produced here.</p>
        </div>
      </section>

      <section className="if-split" data-tone="paper">
        <article data-reveal>
          <h2 className="if-label"><span>01</span>Design &amp; engineering</h2>
          <p>{infrastructure.design}</p>
        </article>
        <article data-reveal>
          <h2 className="if-label"><span>02</span>Production</h2>
          <p>{infrastructure.production}</p>
        </article>
      </section>

      <section className="if-mosaic" data-tone="paper" aria-label="The works">
        {[p1, p2, p3, p4].map((ph, i) => (
          <figure key={i} className={`if-mosaic__f if-mosaic__f--${i + 1}`} data-reveal="image">
            <Image src={ph.src} alt={ph.alt} placeholder="blur" sizes="(max-width: 860px) 92vw, 50vw" />
            <figcaption>{ph.alt}</figcaption>
          </figure>
        ))}
      </section>

      <section className="if-inv" data-tone="dark" aria-labelledby="inv-h">
        <div className="if-inv__head">
          <h2 id="inv-h" className="h2" data-reveal>Plant &amp; machinery</h2>
          <p data-reveal>{infrastructure.machinery.length} lines of plant, from the cranes that lift the active part to the booth that finishes the tank.</p>
        </div>
        <ol className="if-inv__list" data-reveal="stagger">
          {infrastructure.machinery.map((m, i) => (
            <li key={m}><span>{String(i + 1).padStart(2, '0')}</span>{m}</li>
          ))}
        </ol>
      </section>

      <section className="if-test" data-tone="paper" aria-labelledby="test-h">
        <h2 id="test-h" className="h2" data-reveal>Test &amp; measuring equipment</h2>
        <ul className="if-test__list" data-reveal="stagger">
          {testEquipment.slice(0, 6).map(t => (
            <li key={t.name}><strong>{t.name}</strong>{t.detail && <span>{t.detail}</span>}</li>
          ))}
        </ul>
        <p className="if-test__more" data-reveal><Link href="/quality" className="link-arrow">Full list and test standards <span aria-hidden="true">→</span></Link></p>
      </section>

      <section className="if-visit" data-tone="paper" aria-labelledby="visit-h">
        <div data-reveal>
          <h2 id="visit-h" className="h2">Visit the works</h2>
          <p>Customers visit for inspection, vendor development and audits.</p>
        </div>
        <address data-reveal>
          {company.address.street}<br />{company.address.locality}, {company.address.city}<br />{company.address.region}, {company.address.country}
        </address>
        <div className="if-visit__actions" data-reveal>
          <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn--blue">Open in Maps</a>
          <Link href="/contact" className="link-arrow">Arrange a visit <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <PageMotion />
    </main>
  );
}
