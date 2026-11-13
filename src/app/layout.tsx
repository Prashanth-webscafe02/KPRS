import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, Inter, Manrope } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { company } from '@/content/company';
import './globals.css';
import './pages.css';

// Typography
//   Manrope       display and headings
//   Inter         body copy and interface text
//   IBM Plex Mono technical annotations only (specs, test values, drawing callouts)
//   Archivo       kept only for its width axis, which the anatomy step numerals and
//                 the sector names animate along
//
// globals.css references the families by their real names rather than through the
// --font-* variables: the variables put next/font's size-adjusted fallback faces
// into the stack, and glyphs outside the latin subset (≤, Ω) would then render
// from a scaled Arial. next/font registers @font-face under the real names.
const manrope = Manrope({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-cond', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(company.officialSite),
  title: {
    default: 'KPRS Transformers — Power, distribution & dry-type transformers, Bangalore',
    template: '%s — KPRS Transformers',
  },
  description:
    'Kiran Power Rectification Services (KPRS), Bangalore: power transformers to 50 MVA and 132 kV class, distribution, dry-type and furnace-duty transformers. Designed, built and routine-tested in-house since 1992.',
  icons: { icon: '/brand/kprs-logo-footer.png' },
  openGraph: { siteName: 'KPRS Transformers', type: 'website', locale: 'en_IN' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0c0a',
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.name,
  alternateName: company.brand,
  url: company.officialSite,
  logo: `${company.officialSite}/templates/constructone/images/kiranlogo.png`,
  foundingDate: String(company.established),
  email: company.email,
  telephone: company.phones.map(p => p.href.replace('tel:', '')),
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.region,
    addressCountry: 'IN',
  },
  sameAs: company.social.map(s => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script adds the `js` class before hydration.
    <html lang="en-IN" className={`${manrope.variable} ${inter.variable} ${plex.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
