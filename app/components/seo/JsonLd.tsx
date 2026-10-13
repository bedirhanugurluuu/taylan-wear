import type {JsonLd as JsonLdData} from '~/lib/seo';

/**
 * Safe JSON-LD script. Skips invalid / empty payloads and escapes `<`.
 */
export function JsonLd({data}: {data?: JsonLdData | JsonLdData[] | null}) {
  if (!data) return null;

  const items = (Array.isArray(data) ? data : [data]).filter(
    (item): item is JsonLdData =>
      Boolean(item) && typeof item === 'object' && !Array.isArray(item),
  );

  if (!items.length) return null;

  try {
    const json = JSON.stringify(items.length === 1 ? items[0] : items).replace(
      /</g,
      '\\u003c',
    );
    if (!json || json === '{}' || json === '[]' || json === 'null') return null;

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: json}}
      />
    );
  } catch {
    return null;
  }
}
