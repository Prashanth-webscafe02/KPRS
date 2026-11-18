'use client';

// Illustrative 3D exhibit for a product page. Nothing three.js is loaded until
// the section is within 400px of the viewport; then the viewer module is
// imported, a canvas created, and everything is disposed again on unmount.
// If WebGL is unavailable, the KPRS photograph is shown in its place.
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ModelPart, ModelPartId, Photo } from '@/content/company';
import type { ProductViewer } from '@/three/productViewer';

type Status = 'idle' | 'loading' | 'ready' | 'fallback';

export default function ProductModel({ name, parts, photo }: { name: string; parts: ModelPart[]; photo: Photo }) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const viewer = useRef<ProductViewer | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [active, setActive] = useState<ModelPartId | null>(null);

  useEffect(() => {
    const section = sectionRef.current, wrap = wrapRef.current;
    if (!section || !wrap) return;
    let cancelled = false;
    let canvas: HTMLCanvasElement | null = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setStatus('loading');
      import('@/three/productViewer').then(({ createProductViewer }) => {
        if (cancelled) return;
        canvas = document.createElement('canvas');
        canvas.className = 'pd-model__canvas';
        canvas.tabIndex = 0;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `Illustrative 3D model of a ${name.toLowerCase().replace(/s$/, '')}. Drag, or use the left and right arrow keys, to turn it.`);
        wrap.prepend(canvas);
        try {
          viewer.current = createProductViewer({
            canvas,
            reduced,
            onReady: () => { if (!cancelled) setStatus('ready'); },
            onMarker: p => {
              const m = markerRef.current;
              if (!m) return;
              if (!p || !p.visible) { m.style.opacity = '0'; return; }
              m.style.opacity = '1';
              m.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
            },
          });
        } catch {
          canvas.remove(); canvas = null;
          setStatus('fallback');
        }
      }, () => { if (!cancelled) setStatus('fallback'); });
    }, { rootMargin: '400px 0px' });
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      viewer.current?.dispose();
      viewer.current = null;
      canvas?.remove();
    };
  }, [name]);

  const select = (id: ModelPartId) => {
    const next = active === id ? null : id;
    setActive(next);
    viewer.current?.focus(next);
  };
  const reset = () => { setActive(null); viewer.current?.focus(null); };
  const current = parts.find(p => p.id === active);

  return (
    <section ref={sectionRef} className="pd-model" data-tone="dark" aria-labelledby="model-h">
      <div className="pd-model__head">
        <p className="kicker" data-reveal>Illustrative model</p>
        <h2 id="model-h" className="h2" data-reveal>Where the fittings sit</h2>
        <p className="pd-model__note" data-reveal>
          A three-dimensional illustration of an oil-immersed power transformer, to show how its main fittings are arranged.
          It is not a model of a particular KPRS unit: layout, rating and fittings are set by each order. The photograph above shows a built KPRS transformer.
        </p>
      </div>

      <div className={`pd-model__stage is-${status}`} data-reveal>
        <div ref={wrapRef} className="pd-model__view">
          <div ref={markerRef} className="pd-model__marker" aria-hidden="true">
            <span className="pd-model__dot" />
            <span className="pd-model__tag">{current?.name}</span>
          </div>
        </div>
        {status === 'fallback' ? (
          <figure className="pd-model__fallback product-cut">
            <Image src={photo.src} alt={photo.alt} sizes="(max-width: 860px) 100vw, 60vw" />
            <figcaption className="pd-model__fallback-note">3D view unavailable on this device. Photograph shown.</figcaption>
          </figure>
        ) : (
          <>
            <p className="pd-model__status" aria-live="polite">{status === 'ready' ? '' : 'Loading model…'}</p>
            <p className="pd-model__hint" aria-hidden="true"><span>Drag to turn</span>{active && <button type="button" onClick={reset}>Whole machine</button>}</p>
          </>
        )}
        <p className="pd-model__label" aria-hidden="true"><b>Illustrative</b> · not to scale</p>
      </div>

      <div className="pd-model__parts">
        <ol data-reveal="stagger">
          {parts.map((p, i) => (
            <li key={p.id}>
              <button type="button" aria-pressed={active === p.id} disabled={status === 'fallback'} onClick={() => select(p.id)}>
                <span className="pd-model__no">{String(i + 1).padStart(2, '0')}</span>
                <span className="pd-model__name">{p.name}</span>
              </button>
              <p className="pd-model__body" hidden={active !== p.id}>{p.body}</p>
            </li>
          ))}
        </ol>
        <p className="pd-model__detail" aria-live="polite">{current ? current.body : 'Choose a fitting to bring it into view.'}</p>
      </div>
    </section>
  );
}
