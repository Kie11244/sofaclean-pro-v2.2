// src/app/sitemap.ts
// ปิดแคชเพื่อให้ sitemap ออกค่าใหม่ทุกครั้ง
export const revalidate = 3600;

import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

// ดึง base URL จาก header ของ request โดยตรง
function getBaseUrl(): string {
  try {
    const h = headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`.replace(/\/+$/, '');
  } catch {
    // เผื่อถูกเรียกตอน build: fallback เป็นโดเมนบน Vercel
    // เผื่อถูกเรียกตอน build: fallback เป็นโดเมนบน Vercel
  }
  return 'https://sofaclean-pro-v2.vercel.app';
}

const base = getBaseUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = (d: string) => new Date(d).toISOString();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`,        changeFrequency: 'daily',  priority: 1.0, lastModified: new Date() },
    { url: `${base}/en`,      changeFrequency: 'daily',  priority: 1.0, lastModified: new Date() },
    { url: `${base}/en/blog`, changeFrequency: 'weekly', priority: 0.9, lastModified: new Date() },
    { url: `${base}/th`,      changeFrequency: 'daily',  priority: 1.0, lastModified: new Date() },
    { url: `${base}/th/blog`, changeFrequency: 'weekly', priority: 0.9, lastModified: new Date() },
  ];

  const posts: MetadataRoute.Sitemap = [
    { url: `${base}/en/blog/how-to-clean-fabric-sofa`, lastModified: now('2024-07-21'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/th/blog/how-to-clean-fabric-sofa`, lastModified: now('2024-07-21'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/en/blog/when-to-clean-car-seats`,  lastModified: now('2024-07-18'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/th/blog/when-to-clean-car-seats`,  lastModified: now('2024-07-18'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/th/blog/บริการซักเบาะโซฟา-ทำความสะอาดถึงบ้าน-สะอาด-ปลอดภัย-เหมือนใหม่`, lastModified: now('2025-08-13'), changeFrequency: 'monthly', priority: 0.8 },
  ];

  return [...staticUrls, ...posts];
}
