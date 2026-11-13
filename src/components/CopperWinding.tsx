import { Fragment } from 'react';
import { winding } from '@/content/site';

/** 02 · Winding / manifesto. Words are pre-split into spans here (the original
 *  split innerHTML at runtime, which would mutate React-owned DOM). */
export default function CopperWinding() {
  const words = winding.statement.trim().split(/\s+/);
  return (
    <section className="winding" id="winding" data-tone="dark">
      <div className="winding__coil" aria-hidden="true">
        <div className="winding__former">
          <div className="winding__turns" data-turns></div>
        </div>
        <div className="winding__counter">
          <span>Turn</span><strong data-turn-count>0000</strong><span>/ 1 184</span>
        </div>
      </div>

      <div className="winding__text">
        <p className="kicker"><span>02</span>On method</p>
        <p className="winding__statement" data-scrub-words>
          {words.map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span className="w">{w}</span></Fragment>)}
        </p>
        <div className="winding__aside">
          <p>{winding.aside}</p>
          <p className="mono">{winding.materials}</p>
        </div>
      </div>
    </section>
  );
}
