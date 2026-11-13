import { sectors } from '@/content/site';

/** 06 · Sectors. Names condense along the Archivo width axis (lib/animations/sectors.ts). */
export default function Sectors() {
  return (
    <section className="sectors" id="sectors" data-tone="dark">
      <div className="sectors__head">
        <p className="kicker"><span>06</span>Where the load is</p>
        <p className="sectors__lede">Transformers sit at the point where generation becomes use. Ours sit at these.</p>
      </div>
      <ol className="sectors__list">
        {sectors.map(s => (
          <li key={s.no}><span className="sectors__no">{s.no}</span><span className="sectors__name">{s.name}</span><span className="sectors__note">{s.note}</span></li>
        ))}
      </ol>
    </section>
  );
}
