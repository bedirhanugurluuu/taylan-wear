import {getCollectionSeoCopy} from '~/lib/seo';

/**
 * Short, unique category copy for SEO / LLM crawlers.
 * Rendered below the product grid; never blocks the page if missing.
 */
export function CollectionSeoContent({
  handle,
  title,
}: {
  handle?: string | null;
  title?: string | null;
}) {
  if (!handle || !title) return null;

  const copy = getCollectionSeoCopy(handle, title);

  return (
    <section className="collection-seo" aria-labelledby="collection-seo-heading">
      <h2 id="collection-seo-heading" className="collection-seo__title">
        {copy.heading}
      </h2>
      <p className="collection-seo__body">{copy.body}</p>
    </section>
  );
}
