import Image from 'next/image';
import Link from 'next/link';
import { company, nav, products } from '@/content/company';
import logo from '@/assets/brand/kprs-logo.png';

/** Site footer, set out like a drawing title block: one ruled grid of cells. */
export default function SiteFooter() {
  const a = company.address;
  return (
    <footer className="ftr" data-tone="paper">
      <div className="ftr__brand">
        <Image src={logo} alt="KPRS Transformers — Kiran Power Rectification Services Pvt. Ltd." className="ftr__logo" sizes="(max-width: 860px) 92vw, 640px" />
        <p className="ftr__line">Transformers designed, wound and tested in Bangalore since {company.established}.</p>
      </div>

      <div className="ftr__grid">
        <div className="ftr__cell">
          <p className="ftr__label">Company</p>
          <ul>
            {nav.filter(n => n.href !== '/products').map(n => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="ftr__cell">
          <p className="ftr__label">Products</p>
          <ul>
            {products.map(p => <li key={p.slug}><Link href={`/products/${p.slug}`}>{p.name}</Link></li>)}
            <li><Link href="/products#services">Service &amp; repair</Link></li>
          </ul>
        </div>
        <div className="ftr__cell">
          <p className="ftr__label">Works</p>
          <address>
            {a.street}<br />{a.locality}, {a.city}<br />{a.region}, {a.country}
          </address>
          <a className="ftr__map" href={company.mapUrl} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>
        </div>
        <div className="ftr__cell">
          <p className="ftr__label">Telephone &amp; email</p>
          <ul>
            {company.phones.map(p => <li key={p.href}><a href={p.href}>{p.label}</a></li>)}
            <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="ftr__base">
        <p>© {new Date().getFullYear()} {company.name}</p>
        <p>BIS licensed · ISO 9001 certified · MSME registered</p>
        <ul className="ftr__social">
          {company.social.map(s => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
        </ul>
      </div>
    </footer>
  );
}
