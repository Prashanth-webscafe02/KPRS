import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="content" className="pg pg-404">
      <section className="nf" data-tone="paper">
        <p className="kicker">404</p>
        <h1 className="nf__title">This sheet is not in the register.</h1>
        <p>The page may have moved. Start from the products, or go back to the homepage.</p>
        <p className="nf__actions"><Link href="/products" className="btn btn--accent">Products</Link><Link href="/" className="link-arrow">Homepage <span aria-hidden="true">→</span></Link></p>
      </section>
    </main>
  );
}
