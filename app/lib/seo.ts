import type {MetaDescriptor} from 'react-router';
import {SITE_SEO} from '~/lib/site-content';

export type SeoInput = {
  origin?: string | null;
  path?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  /** When false, title is used as-is (default: append site name). */
  titleTemplate?: boolean;
};

export type JsonLd = Record<string, unknown>;

function safeString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim();
}

export function stripHtml(value: unknown): string {
  const text = safeString(value);
  if (!text) return '';
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(value: unknown, max = 160): string {
  const text = stripHtml(value);
  if (!text || text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const boundary = sliced.lastIndexOf(' ');
  return `${(boundary > 80 ? sliced.slice(0, boundary) : sliced).trim()}…`;
}

export function originFromRequest(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return '';
  }
}

export function absoluteUrl(
  origin: string | null | undefined,
  pathOrUrl: string | null | undefined,
): string {
  const raw = safeString(pathOrUrl);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = safeString(origin).replace(/\/$/, '');
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}

export function canonicalPath(pathname: string | null | undefined): string {
  const path = safeString(pathname) || '/';
  if (path === '/') return '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function buildTitle(input: SeoInput): string {
  const pageTitle = safeString(input.title);
  const useTemplate = input.titleTemplate !== false;
  if (!pageTitle) return SITE_SEO.name;
  if (!useTemplate) return pageTitle;
  if (pageTitle === SITE_SEO.name) return pageTitle;
  if (pageTitle.includes(SITE_SEO.name)) return pageTitle;
  return `${pageTitle} | ${SITE_SEO.name}`;
}

/**
 * Builds React Router meta descriptors. Never throws — missing fields are skipped.
 */
export function buildSeoMeta(input?: SeoInput | null): MetaDescriptor[] {
  try {
    const seo = input ?? {};
    const title = buildTitle(seo);
    const description =
      truncate(seo.description, 160) || SITE_SEO.defaultDescription;
    const origin = safeString(seo.origin);
    const path = canonicalPath(seo.path);
    const url = absoluteUrl(origin, path);
    const image = absoluteUrl(
      origin,
      safeString(seo.image) || SITE_SEO.defaultOgImage,
    );
    const imageAlt = safeString(seo.imageAlt) || title;
    const type = seo.type ?? 'website';

    const tags: MetaDescriptor[] = [
      {title},
      {name: 'description', content: description},
      {property: 'og:type', content: type},
      {property: 'og:site_name', content: SITE_SEO.name},
      {property: 'og:locale', content: SITE_SEO.locale},
      {property: 'og:title', content: title},
      {property: 'og:description', content: description},
      {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
      {name: 'twitter:title', content: title},
      {name: 'twitter:description', content: description},
    ];

    if (url) {
      tags.push(
        {rel: 'canonical', href: url},
        {property: 'og:url', content: url},
      );
    }

    if (image) {
      tags.push(
        {property: 'og:image', content: image},
        {property: 'og:image:alt', content: imageAlt},
        {name: 'twitter:image', content: image},
      );
    }

    if (seo.noindex) {
      tags.push({name: 'robots', content: 'noindex, nofollow'});
    } else {
      tags.push({name: 'robots', content: 'index, follow'});
    }

    return tags;
  } catch {
    return [
      {title: SITE_SEO.name},
      {name: 'description', content: SITE_SEO.defaultDescription},
    ];
  }
}

export function seoFromLoaderData(
  data: {seo?: SeoInput | null} | null | undefined,
): MetaDescriptor[] {
  return buildSeoMeta(data?.seo ?? null);
}

function compactJsonLd<T extends JsonLd>(value: T): T | null {
  try {
    const entries = Object.entries(value).filter(([, v]) => {
      if (v == null) return false;
      if (v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
    if (!entries.length) return null;
    return Object.fromEntries(entries) as T;
  } catch {
    return null;
  }
}

export function buildOrganizationJsonLd(origin: string): JsonLd | null {
  const url = absoluteUrl(origin, '/');
  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_SEO.name,
    url: url || undefined,
    logo: absoluteUrl(origin, SITE_SEO.logo) || undefined,
    email: SITE_SEO.email || undefined,
    telephone: SITE_SEO.phone || undefined,
    address: SITE_SEO.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: SITE_SEO.address,
          addressCountry: 'TR',
        }
      : undefined,
    sameAs: SITE_SEO.sameAs.filter(Boolean),
  });
}

export function buildWebSiteJsonLd(origin: string): JsonLd | null {
  const url = absoluteUrl(origin, '/');
  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_SEO.name,
    url: url || undefined,
    inLanguage: 'tr-TR',
    potentialAction: url
      ? {
          '@type': 'SearchAction',
          target: `${url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        }
      : undefined,
  });
}

export function buildBreadcrumbJsonLd(
  origin: string,
  items: Array<{name: string; path: string}>,
): JsonLd | null {
  const list = items
    .map((item, index) => {
      const name = safeString(item.name);
      const itemUrl = absoluteUrl(origin, item.path);
      if (!name || !itemUrl) return null;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: itemUrl,
      };
    })
    .filter(Boolean);

  if (!list.length) return null;

  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list,
  });
}

export function buildCollectionJsonLd(input: {
  origin: string;
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
}): JsonLd | null {
  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: safeString(input.title),
    description: truncate(input.description, 300) || undefined,
    url: absoluteUrl(input.origin, input.path) || undefined,
    isPartOf: absoluteUrl(input.origin, '/') || undefined,
    image: absoluteUrl(input.origin, input.image) || undefined,
  });
}

export function buildProductJsonLd(input: {
  origin: string;
  name: string;
  description?: string | null;
  path: string;
  image?: string | null;
  sku?: string | null;
  brand?: string | null;
  price?: string | null;
  currency?: string | null;
  availability?: 'InStock' | 'OutOfStock' | null;
}): JsonLd | null {
  const url = absoluteUrl(input.origin, input.path);
  const image = absoluteUrl(input.origin, input.image);
  const offers =
    input.price && input.currency
      ? {
          '@type': 'Offer',
          url: url || undefined,
          priceCurrency: input.currency,
          price: input.price,
          availability: input.availability
            ? `https://schema.org/${input.availability}`
            : undefined,
          seller: {
            '@type': 'Organization',
            name: SITE_SEO.name,
          },
        }
      : undefined;

  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeString(input.name),
    description: truncate(input.description, 500) || undefined,
    url: url || undefined,
    image: image ? [image] : undefined,
    sku: safeString(input.sku) || undefined,
    brand: {
      '@type': 'Brand',
      name: safeString(input.brand) || SITE_SEO.name,
    },
    offers,
  });
}

export function buildArticleJsonLd(input: {
  origin: string;
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  author?: string | null;
}): JsonLd | null {
  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: safeString(input.title),
    description: truncate(input.description, 300) || undefined,
    url: absoluteUrl(input.origin, input.path) || undefined,
    image: absoluteUrl(input.origin, input.image) || undefined,
    datePublished: safeString(input.publishedAt) || undefined,
    author: {
      '@type': 'Person',
      name: safeString(input.author) || SITE_SEO.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_SEO.name,
      logo: absoluteUrl(input.origin, SITE_SEO.logo) || undefined,
    },
  });
}

export function getCollectionSeoCopy(
  handle: string,
  title: string,
): {heading: string; body: string} {
  const known = SITE_SEO.collectionCopy[handle];
  if (known) return known;

  const safeTitle = safeString(title) || 'koleksiyon';
  return {
    heading: `${safeTitle} koleksiyonu`,
    body: `${safeTitle} modellerini Taylan Wear’da keşfet. Günlük kullanıma uygun kesimler, sade detaylar ve sezonun ihtiyaçlarına göre seçilmiş parçalar. Ürünleri inceleyip beden ve renk seçenekleriyle siparişini kolayca tamamlayabilirsin.`,
  };
}
