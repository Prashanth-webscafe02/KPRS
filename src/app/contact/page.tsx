import type { Metadata } from 'next';
import { Suspense } from 'react';
import PageMotion from '@/components/site/PageMotion';
import EnquiryForm from '@/components/site/EnquiryForm';
import { company } from '@/content/company';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact KPRS Transformers, Plot No. 10, Bommasandra–Jigani Link Road, Bangalore. Telephone 080 4207 7095, email sales@kprsindia.com.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const a = company.address;
  return (
    <main id="content" className="pg pg-contact">
      <section className="ct" data-tone="paper">
        <div className="ct__intro">
          <p className="kicker" data-reveal>Contact</p>
          <h1 className="ct__title" data-reveal="lines">
            <span className="ln"><span>Send us</span></span>
            <span className="ln"><span><em>the duty.</em></span></span>
          </h1>
          <p className="ct__lede" data-reveal>Rating, voltage ratio, vector group, site conditions — or simply the problem. An engineer replies.</p>

          <dl className="ct__block" data-reveal="stagger">
            <div>
              <dt>Telephone</dt>
              <dd>{company.phones.map(p => <a key={p.href} href={p.href}>{p.label}</a>)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            </div>
            <div>
              <dt>Works</dt>
              <dd>
                <address>{company.name}<br />{a.street}<br />{a.locality}, {a.city}<br />{a.region}, {a.country}</address>
                <a className="ct__map" href={company.mapUrl} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>
              </dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd><a href={company.whatsapp} target="_blank" rel="noopener noreferrer">+91 99015 99774</a></dd>
            </div>
          </dl>
        </div>

        <div className="ct__form" data-reveal>
          <h2 className="ct__form-title">Product enquiry</h2>
          <Suspense fallback={null}>
            <EnquiryForm />
          </Suspense>
        </div>
      </section>
      <PageMotion />
    </main>
  );
}
