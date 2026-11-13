import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif, Martian_Mono } from 'next/font/google';
import './globals.css';

// Same three families the original loaded from Google Fonts, now self-hosted:
// Archivo (wdth 62–125, variable wght), Instrument Serif (regular + italic),
// Martian Mono (variable wght).
//
// globals.css references the families by their real names ("Archivo", …), exactly
// as the original stylesheet did, rather than through the --font-* variables.
// The variables would put next/font's size-adjusted "… Fallback" faces into the
// stack, and glyphs outside the latin subset (≤, Ω) would then render from Arial
// at 157 % for Martian Mono, widening the test-record columns. (Turbopack in
// Next 16.4 ignores `adjustFontFallback: false`.) next/font registers its
// @font-face rules under the real family names, so the names resolve to these files.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-sans', display: 'swap' });
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const martian = Martian_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'KPRS — Power & Distribution Transformers',
  description: 'KPRS designs and builds power, distribution and special-duty transformers. Wound, tested and certified in-house.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0c0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script adds the `js` class before hydration, as the original did.
    <html lang="en" className={`${archivo.variable} ${instrument.variable} ${martian.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
