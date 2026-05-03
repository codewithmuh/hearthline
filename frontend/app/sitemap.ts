import type { MetadataRoute } from "next";

const SITE_URL = "https://hearthline.codewithmuh.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`,        lastModified, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/faq`,     lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/docs`,    lastModified, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,   lastModified, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
