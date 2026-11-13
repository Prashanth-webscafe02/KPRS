import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageMotion from '@/components/site/PageMotion';
import { products, services, special } from '@/content/company';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'KPRS power transformers (5–50 MVA, to 132 kV class), distribution transformers, class F/H dry-type transformers and furnace-duty transformers, plus service, repair and AMC.',
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return (
    <main id="content" className="pg pg-products">
      <section className="pr-hero" data-tone="graphite">
        <div className="pr-hero__head">
          <p className="kicker" data-reveal>Products</p>
          <h1 className="pr-hero__title" data-reveal="lines">
            <span className="ln"><span>Every family,</span></span>
            <span className="ln"><span><em>one set of hands.</em></span></span>
          </h1>
          <p className="pr-hero__lede" data-reveal>Every KPRS transformer is designed, wound, assembled and routine-tested at the Bommasandra works.</p>
        </div>

        {/* the index: a ruled list on desktop, a swipeable row of chips on phones */}
        <nav className="pr-index" aria-label="Product families">
          <ol data-reveal="stagger">
            {products.map(p => (
              <li key={p.slug}>
                <a href={`#${p.slug}`}>
                  <span className="pr-index__no">{p.index}</span>
                  <span className="pr-index__name">{p.name}</span>
                  <span className="pr-index__spec">{p.headline[0][1]}</span>
                  <span className="pr-index__arrow" aria-hidden="true">↓</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {products.map((p, i) => (
        <section key={p.slug} id={p.slug} className={`pr-exhibit${i % 2 ? ' pr-exhibit--flip' : ''}`} data-tone="paper" aria-labelledby={`${p.slug}-h`}>
          <figure className="pr-exhibit__photo" data-reveal="image">
            <Image src={p.photo.src} alt={p.photo.alt} placeholder="blur" sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="pr-exhibit__no" aria-hidden="true">{p.index}</span>
          </figure>
          <div className="pr-exhibit__body">
            <h2 id={`${p.slug}-h`} className="pr-exhibit__name" data-reveal>{p.name}</h2>
            <p className="pr-exhibit__lede" data-reveal>{p.lede}</p>
            <dl className="pr-exhibit__figs" data-reveal="stagger">
              {p.headline.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <p className="pr-exhibit__apps" data-reveal><span>For</span> {p.applications.join(' · ')}</p>
            <div className="pr-exhibit__actions" data-reveal>
              <Link href={`/products/${p.slug}`} className="btn btn--blue">Specifications<span className="sr-only"> — {p.name}</span></Link>
              <Link href={`/contact?product=${p.slug}`} className="link-arrow">Enquire <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>
      ))}

      <section className="pr-special" id="special" data-tone="dark">
        <p className="kicker" data-reveal>Built to specification</p>
        <p className="pr-special__text" data-reveal>{special}</p>
        <Link href="/contact?product=special" className="btn btn--accent btn--lg" data-reveal>Describe the duty</Link>
      </section>

      <section className="pr-services" id="services" data-tone="paper" aria-labelledby="services-h">
        <div className="pr-services__head">
          <p className="kicker" data-reveal>After delivery</p>
          <h2 id="services-h" className="h2" data-reveal>Service, repair and maintenance</h2>
          <p data-reveal>{services.intro}</p>
        </div>
        <ul className="pr-services__list" data-reveal="stagger">
          {services.items.map((s, i) => (
            <li key={s.title}><span className="pr-services__no">S{i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></li>
          ))}
        </ul>
      </section>
      <PageMotion />
    </main>
  );
}
