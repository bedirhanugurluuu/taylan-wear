import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CATEGORIES} from '~/lib/site-content';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildSeoMeta,
  originFromRequest,
} from '~/lib/seo';

const FALLBACK_IMAGES: Record<string, string> = {
  ...Object.fromEntries(
    CATEGORIES.map((item) => [
      item.href.replace('/collections/', ''),
      item.image,
    ]),
  ),
  all: '/hero-10.jpg',
  kazak: '/kazak.jpg',
  esofman: '/esofman.jpg',
  jogger: '/jogger.jpg',
  'ust-giyim': '/sweatshirt.jpg',
  'dis-giyim': '/ceket.jpg',
  'alt-giyim': '/pantolon.jpg',
  'kot-pantolon': '/pantolon.jpg',
};

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  const origin = originFromRequest(args.request);

  return {
    ...deferredData,
    ...criticalData,
    seo: {
      origin,
      path: '/collections',
      title: 'Koleksiyonlar',
      description:
        'Taylan Wear koleksiyonlarını keşfet. Hırka, pantolon, sweatshirt, triko, ceket ve daha fazlası.',
    },
    jsonLd: [
      buildBreadcrumbJsonLd(origin, [
        {name: 'Ana sayfa', path: '/'},
        {name: 'Koleksiyonlar', path: '/collections'},
      ]),
    ].filter(Boolean),
  };
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections};
}

function loadDeferredData(_args: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections, jsonLd} = useLoaderData<typeof loader>();

  return (
    <div className="collections-index">
      <JsonLd data={jsonLd} />
      <div className="collections-index__inner">
        <h1 className="collections-index__title">Koleksiyonlar</h1>
        <PaginatedResourceSection<CollectionFragment>
          connection={collections}
          resourcesClassName="collections-index__grid"
          ariaLabel="Koleksiyonlar"
        >
          {({node: collection, index}) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  const fallbackSrc = FALLBACK_IMAGES[collection.handle];
  const image = collection.image;

  return (
    <Link
      className="collections-index__card"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="collections-index__media">
        {image ? (
          <Image
            alt={image.altText || collection.title}
            aspectRatio="4/5"
            data={image}
            loading={index < 6 ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="collections-index__img"
          />
        ) : fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={collection.title}
            width={800}
            height={1000}
            loading={index < 6 ? 'eager' : 'lazy'}
            decoding="async"
            className="collections-index__img"
          />
        ) : (
          <span className="collections-index__placeholder" aria-hidden="true" />
        )}
      </div>
      <span className="collections-index__name">{collection.title}</span>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
