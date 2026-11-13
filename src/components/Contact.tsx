import { contact } from '@/content/site';

/** The enquiry block at the top of the SHT 07 footer. */
export default function Contact() {
  return (
    <div className="enquire__top">
      <p className="kicker">§ 07 — Enquire</p>
      <h2 className="enquire__title"><span>Send us</span> <em>the duty.</em></h2>
      <p className="enquire__lede">Rating, voltage ratio, vector group, site conditions — or simply the problem. An engineer replies, not a salesperson.</p>
      <a className="enquire__cta" href={`mailto:${contact.email}`}>
        <span>{contact.email}</span>
        <svg viewBox="0 0 40 12" aria-hidden="true"><path d="M0 6h38M32 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
      </a>
    </div>
  );
}
