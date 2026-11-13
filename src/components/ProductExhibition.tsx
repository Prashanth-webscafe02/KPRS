import Link from 'next/link';
import { plates } from '@/content/site';
import { drawingSvg } from '@/three/drawings';

/** 04 · Horizontal product exhibition. Drawings are pure SVG strings,
 *  rendered on the server so there is nothing to drift at hydration. */
export default function ProductExhibition() {
  return (
    <section className="range" id="range" data-tone="graphite">
      <div className="range__pin" data-range-pin>
        <div className="range__track" data-range-track>

          <div className="range__intro">
            <p className="kicker"><span>04</span>The range</p>
            <h2 className="range__title">Five families. <em>One works.</em></h2>
            <p className="range__lede">Each drawn, wound and tested by the same hands. Elevations are schematic.</p>
            <p className="range__hint">Scroll to move through plates I–V</p>
            <p className="range__swipe" aria-hidden="true">Swipe through the range</p>
          </div>

          {plates.map(p => (
            <article className="plate" data-plate={p.drawing} key={p.num}>
              <div className="plate__num">{p.num}</div>
              <figure className="plate__drawing" data-drawing={p.drawing} dangerouslySetInnerHTML={{ __html: drawingSvg(p.drawing) }} />
              <div className="plate__body">
                <h3 className="plate__name">{p.name[0]}<br /><em>{p.name[1]}</em></h3>
                <p>{p.body}</p>
                <table className="spec">
                  <tbody>
                    {p.spec.map(([k, v], i) => <tr key={i}><th>{k}</th><td>{v}</td></tr>)}
                  </tbody>
                </table>
                <p className="plate__more"><Link href={p.href}>{p.drawing === 'special' ? 'Built to specification' : 'Product details'} <span aria-hidden="true">→</span></Link></p>
              </div>
            </article>
          ))}

          <div className="range__end">
            <p className="kicker">Not in the range?</p>
            <p className="range__end-line">Special ratings are drawn to order. <Link href="/contact">Send us the duty.</Link></p>
          </div>
        </div>

        <div className="range__rail" aria-hidden="true">
          <span>PLATE</span><span className="range__rail-num" data-plate-num>—</span>
          <div className="range__rail-bar"><span data-range-progress></span></div>
        </div>
      </div>
    </section>
  );
}
