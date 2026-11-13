import Link from 'next/link';
import { contact } from '@/content/site';

/** 07 · Enquire. The closing call to action of the homepage; contact details
 *  live in the site footer directly below it. */
export default function Enquire() {
  return (
    <section className="enquire" id="enquire" data-tone="paper">
      <div className="enquire__top">
        <p className="kicker"><span>07</span>Enquire</p>
        <h2 className="enquire__title"><span>Send us</span> <em>the duty.</em></h2>
        <p className="enquire__lede">Rating, voltage ratio, vector group, site conditions — or simply the problem. An engineer replies, not a salesperson.</p>
        <div className="enquire__actions">
          <Link className="btn btn--accent btn--lg" href="/contact">Start an enquiry</Link>
          <a className="enquire__cta" href={`mailto:${contact.email}`}>
            <span>{contact.email}</span>
            <svg viewBox="0 0 40 12" aria-hidden="true"><path d="M0 6h38M32 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
