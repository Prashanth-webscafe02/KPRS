import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageMotion from '@/components/site/PageMotion';
import ProductModel from '@/components/site/ProductModel';
import { productBySlug, products } from '@/content/company';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.name} by KPRS, Bangalore. ${p.lede} ${p.headline.map(([k, v]) => `${k}: ${v}`).join('; ')}.`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { images: [(og => ({ url: og.src, width: og.width, height: og.height, alt: p.photo.alt }))(p.photo.og ?? p.photo.src)] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const related = products.filter(x => x.slug !== p.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `KPRS ${p.name}`,
    description: p.body.join(' '),
    brand: { '@type': 'Brand', name: 'KPRS' },
    manufacturer: { '@type': 'Organization', name: 'Kiran Power Rectification Services Pvt. Ltd.' },
    additionalProperty: p.specs.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
  };

  return (
    <main id="content" className="pg pg-product">
      <section className="pd-hero" data-tone="paper">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol><li><Link href="/products">Products</Link></li><li aria-current="page">{p.name}</li></ol>
        </nav>
        <div className="pd-hero__grid">
          <div className="pd-hero__text">
            <p className="pd-hero__index" data-reveal>{p.index} <span>/ 04</span></p>
            <h1 className="pd-hero__title" data-reveal>{p.name}</h1>
            <p className="pd-hero__lede" data-reveal>{p.lede}</p>
            <div className="pd-hero__actions" data-reveal>
              <Link href={`/contact?product=${p.slug}`} className="btn btn--accent btn--lg">Request a quotation</Link>
              <a href="#specifications" className="link-arrow">Specifications <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <figure className="pd-hero__photo product-cut" data-reveal="image">
            <Image src={p.photo.src} alt={p.photo.alt} placeholder="blur" priority sizes="(max-width: 860px) 100vw, 46vw" />
          </figure>
        </div>
        <dl className="pd-figs" data-reveal="stagger">
          {p.headline.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      <section className="pd-intro" data-tone="paper">
        <div className="pd-intro__body" data-reveal="stagger">
          {p.body.map((b, i) => <p key={i}>{b}</p>)}
        </div>
        <aside className="pd-intro__apps" data-reveal>
          <h2 className="pd-label">Applications</h2>
          <ul>{p.applications.map(a => <li key={a}>{a}</li>)}</ul>
        </aside>
      </section>

      {p.model && <ProductModel name={p.name} parts={p.model.parts} photo={p.photo} />}

      <section className="pd-specs" id="specifications" data-tone="dark" aria-labelledby="spec-h">
        <div className="pd-specs__head">
          <h2 id="spec-h" className="h2" data-reveal>Specifications</h2>
          <p data-reveal>As published by KPRS. Final ratings are confirmed against your enquiry.</p>
        </div>
        <table className="pd-table" data-reveal>
          <caption className="sr-only">{p.name} — technical specifications</caption>
          <tbody>
            {p.specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
        {p.note && <p className="pd-specs__note" data-reveal>{p.note}</p>}
      </section>

      <section className="pd-eng" data-tone="paper" aria-labelledby="eng-h">
        <h2 id="eng-h" className="h2" data-reveal>Engineering notes</h2>
        <ol className="pd-eng__list" data-reveal="stagger">
          {p.engineering.map((e, i) => (
            <li key={e.title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{e.title}</h3><p>{e.body}</p></li>
          ))}
        </ol>
        <p className="pd-eng__more" data-reveal>How the core, windings and tank are built: <Link href="/manufacturing">the manufacturing process</Link>. How every unit is tested: <Link href="/quality">quality &amp; testing</Link>.</p>
      </section>

      {p.accessories && (
        <section className="pd-acc" data-tone="paper" aria-labelledby="acc-h">
          <h2 id="acc-h" className="h2" data-reveal>Fittings &amp; accessories</h2>
          <div className="pd-acc__cols">
            <div data-reveal><h3 className="pd-label">Standard</h3><ul>{p.accessories.standard.map(a => <li key={a}>{a}</li>)}</ul></div>
            <div data-reveal><h3 className="pd-label">Optional</h3><ul>{p.accessories.optional.map(a => <li key={a}>{a}</li>)}</ul></div>
          </div>
        </section>
      )}

      <section className="pd-related" data-tone="paper" aria-labelledby="rel-h">
        <h2 id="rel-h" className="pd-label" data-reveal>Other families</h2>
        <ul className="pd-related__list" data-reveal="stagger">
          {related.map(r => (
            <li key={r.slug}>
              <Link href={`/products/${r.slug}`}>
                <span className="pd-related__img product-cut"><Image src={r.photo.src} alt="" placeholder="blur" sizes="(max-width: 860px) 70vw, 28vw" /></span>
                <span className="pd-related__no">{r.index}</span>
                <span className="pd-related__name">{r.name}</span>
                <span className="pd-related__spec">{r.headline[0][1]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta-band cta-band--blue" data-tone="dark">
        <h2 className="cta-band__title" data-reveal>Send the rating, the ratio and the site. An engineer will reply.</h2>
        <div className="cta-band__actions" data-reveal>
          <Link href={`/contact?product=${p.slug}`} className="btn btn--accent btn--lg">Enquire about {p.short.toLowerCase()} transformers</Link>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageMotion />
    </main>
  );
}
