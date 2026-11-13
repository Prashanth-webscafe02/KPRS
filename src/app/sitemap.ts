import type { MetadataRoute } from 'next';
import { company, products } from '@/content/company';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.officialSite;
  const paths = ['', '/about', '/products', ...products.map(p => `/products/${p.slug}`), '/manufacturing', '/infrastructure', '/quality', '/contact'];
  return paths.map(p => ({ url: `${base}${p}`, changeFrequency: 'monthly', priority: p === '' ? 1 : .7 }));
}
