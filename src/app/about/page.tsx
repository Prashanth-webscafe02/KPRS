import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageMotion from '@/components/site/PageMotion';
import { about, company } from '@/content/company';

export const metadata: Metadata = {
  title: 'About KPRS',
  description:
    'Kiran Power Rectification Services, Bangalore: transformer manufacturer and service company since 1992. BIS licensed, ISO 9001 certified, registered with MSME and SSI.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main id="content" className="pg pg-about">
      <section className="ab-hero" data-tone="paper">
        <p className="kicker" data-reveal>About KPRS</p>
        <h1 className="ab-hero__title" data-reveal="lines">
          <span className="ln"><span>Transformers,</span></span>
          <span className="ln"><span>made in Bangalore</span></span>
          <span className="ln"><span><em>since {company.established}.</em></span></span>
        </h1>
        <div className="ab-hero__grid">
          <dl className="ab-facts" data-reveal="stagger">
            <div><dt>Company</dt><dd>{company.name}</dd></div>
            <div><dt>Established</dt><dd>{company.established}</dd></div>
            <div><dt>Works</dt><dd>Bommasandra, Bangalore</dd></div>
            <div><dt>Market</dt><dd>Southern India, under the KPRS brand</dd></div>
          </dl>
          <p className="ab-hero__intro" data-reveal>{about.intro}</p>
        </div>
      </section>

      <section className="ab-photo" data-tone="paper">
        <figure className="ab-photo__fig" data-reveal="image">
          <Image src={about.photo.src} alt={about.photo.alt} placeholder="blur" sizes="(max-width: 860px) 100vw, 58vw" />
        </figure>
        <div className="ab-photo__text" data-reveal="stagger">
          {about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      <section className="ab-promoter" data-tone="dark">
        <p className="kicker" data-reveal>Leadership</p>
        <blockquote className="ab-promoter__quote" data-reveal>
          <p>{about.promoter}</p>
        </blockquote>
        <p className="ab-promoter__outlook" data-reveal>{about.outlook}</p>
      </section>

      <section className="ab-principles" data-tone="paper">
        <div className="ab-principles__head">
          <p className="kicker" data-reveal>How we work</p>
          <h2 className="h2" data-reveal>Principles the works runs on</h2>
          <p className="ab-principles__vision" data-reveal><span>Vision</span>{about.vision}</p>
        </div>
        <ol className="ab-principles__list">
          {about.principles.map((p, i) => (
            <li key={i} data-reveal><span className="ab-principles__no">0{i + 1}</span><p>{p}</p></li>
          ))}
        </ol>
      </section>

      <section className="ab-reg" data-tone="paper">
        <h2 className="sr-only">Registrations and certifications</h2>
        <ul className="ab-reg__list" data-reveal="stagger">
          {about.registrations.map(r => <li key={r.k}><strong>{r.k}</strong><span>{r.v}</span></li>)}
        </ul>
        <p className="ab-reg__more" data-reveal>
          Approvals, standards and test facilities are set out on <Link href="/quality">Quality &amp; testing</Link>.
        </p>
      </section>

      <section className="cta-band" data-tone="dark">
        <h2 className="cta-band__title" data-reveal>See how a KPRS transformer is made.</h2>
        <div className="cta-band__actions" data-reveal>
          <Link href="/manufacturing" className="btn btn--accent btn--lg">The manufacturing process</Link>
          <Link href="/contact" className="btn btn--ghost btn--lg">Talk to an engineer</Link>
        </div>
      </section>
      <PageMotion />
    </main>
  );
}
