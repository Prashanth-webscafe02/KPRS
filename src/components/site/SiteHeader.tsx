'use client';

// Site header: logo nameplate, primary navigation with a Products menu, contact CTA,
// and a dedicated full-screen mobile menu. Colours follow the section underneath
// (body[data-tone], set by the page's motion controller); see .hdr in globals.css.
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { company, nav, products } from '@/content/company';
import { getLenis } from '@/lib/scrolling/lenis';
// the KPRS mark, cut at its own edges from the official logo banner (no padding)
import logo from '@/assets/brand/kprs-logo-mark.png';

const isActive = (path: string, href: string) => path === href || path.startsWith(href + '/');

export default function SiteHeader() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);            // mobile menu
  const [drop, setDrop] = useState(false);            // desktop products menu
  const [mobProducts, setMobProducts] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const dropWrap = useRef<HTMLLIElement>(null);

  // Close everything on navigation (adjusting state during render, keyed on path).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMenu(false); setDrop(false); setMobProducts(false);
  }

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [path]);

  // Mobile menu: lock background scroll (native and Lenis), trap focus, Escape closes.
  useEffect(() => {
    if (!menu) return;
    const root = document.documentElement;
    root.classList.add('menu-open');
    getLenis()?.stop();
    const first = panel.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); burger.current?.focus(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null);
      const all = burger.current ? [burger.current, ...f] : f;
      const i = all.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
      else if (!e.shiftKey && i === all.length - 1) { e.preventDefault(); all[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.classList.remove('menu-open');
      getLenis()?.start();
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  // Desktop products menu: Escape and outside click close it.
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrop(false); dropWrap.current?.querySelector('button')?.focus(); }
    };
    const onDown = (e: PointerEvent) => { if (!dropWrap.current?.contains(e.target as Node)) setDrop(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [drop]);

  const onDropLeave = useCallback((e: React.FocusEvent) => {
    if (!dropWrap.current?.contains(e.relatedTarget as Node)) setDrop(false);
  }, []);

  return (
    <header className="hdr" data-scrolled={scrolled || undefined} data-menu={menu || undefined}>
      <Link href="/" className="hdr__logo" aria-label="KPRS Transformers — home">
        <Image src={logo} alt="" priority width={119} height={44} />
      </Link>

      <nav className="hdr__nav" aria-label="Primary">
        <ul>
          <li>
            <Link href="/" aria-current={path === '/' ? 'page' : undefined} data-active={path === '/' || undefined}>Home</Link>
          </li>
          {nav.map(item => item.href === '/products' ? (
            <li key={item.href} className="hdr__drop" ref={dropWrap} data-open={drop || undefined}
              onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)} onBlur={onDropLeave}>
              <Link href="/products" aria-current={path === '/products' ? 'page' : undefined}
                data-active={isActive(path, '/products') || undefined}>Products</Link>
              <button type="button" className="hdr__caret" aria-expanded={drop} aria-controls="hdr-products"
                aria-label="Show product categories" onClick={e => setDrop(d => (e.detail === 0 ? !d : true))}>
                <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
              </button>
              <div className="hdr__menu" id="hdr-products">
                <ul>
                  {products.map(p => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} aria-current={path === `/products/${p.slug}` ? 'page' : undefined}>
                        <span className="hdr__menu-no">{p.index}</span>
                        <span className="hdr__menu-name">{p.name}</span>
                        <span className="hdr__menu-spec">{p.headline[0][1]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/products" className="hdr__menu-all">All products and services →</Link>
              </div>
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href} aria-current={path === item.href ? 'page' : undefined}
                data-active={isActive(path, item.href) || undefined}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link href="/contact" className="hdr__cta" aria-current={path === '/contact' ? 'page' : undefined}>Contact us</Link>

      <button ref={burger} type="button" className="hdr__burger" aria-expanded={menu} aria-controls="mobile-menu"
        onClick={() => setMenu(m => !m)}>
        <span className="sr-only">{menu ? 'Close menu' : 'Open menu'}</span>
        <i aria-hidden="true"></i><i aria-hidden="true"></i>
      </button>

      <div className="mnav" id="mobile-menu" ref={panel} hidden={!menu} aria-label="Site menu" role="dialog" aria-modal="true">
        <ul className="mnav__list">
          <li style={{ '--i': 0 } as React.CSSProperties}><Link href="/" aria-current={path === '/' ? 'page' : undefined} data-active={path === '/' || undefined}>Home</Link></li>
          {nav.map((item, n) => item.href === '/products' ? (
            <li key={item.href} style={{ '--i': n + 1 } as React.CSSProperties} className="mnav__group" data-open={mobProducts || undefined}>
              <div className="mnav__row">
                <Link href="/products" aria-current={path === '/products' ? 'page' : undefined} data-active={isActive(path, '/products') || undefined}>Products</Link>
                <button type="button" aria-expanded={mobProducts} aria-controls="mnav-products" onClick={() => setMobProducts(v => !v)}>
                  <span className="sr-only">{mobProducts ? 'Hide' : 'Show'} product categories</span>
                  <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 7h12M7 1v12" /></svg>
                </button>
              </div>
              <ul id="mnav-products" className="mnav__sub" hidden={!mobProducts}>
                {products.map(p => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} aria-current={path === `/products/${p.slug}` ? 'page' : undefined}>
                      <span>{p.index}</span>{p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.href} style={{ '--i': n + 1 } as React.CSSProperties}>
              <Link href={item.href} aria-current={path === item.href ? 'page' : undefined} data-active={isActive(path, item.href) || undefined}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <div className="mnav__foot">
          <Link href="/contact" className="btn btn--accent">Send an enquiry</Link>
          <a href={company.phones[0].href} className="mnav__line">{company.phones[0].label}</a>
          <a href={`mailto:${company.email}`} className="mnav__line">{company.email}</a>
        </div>
      </div>
    </header>
  );
}
