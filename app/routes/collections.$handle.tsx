import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  ProductCard,
  type ProductCardProduct,
} from '~/components/product/ProductCard';
import {CollectionBanner} from '~/components/collection/CollectionBanner';
import {CollectionSeoContent} from '~/components/collection/CollectionSeoContent';
import {
  CollectionControls,
  CollectionSort,
} from '~/components/collection/CollectionFilters';
import {
  getAppliedFilters,
  getSortFromParam,
  type CollectionFilter,
  withoutBrandFilters,
} from '~/lib/collection-filters';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildSeoMeta,
  getCollectionSeoCopy,
  originFromRequest,
  truncate,
} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const origin = originFromRequest(args.request);
  const {collection} = criticalData;
  const path = `/collections/${collection.handle}`;
  const seoCopy = getCollectionSeoCopy(collection.handle, collection.title);
  const description =
    truncate(collection.description, 160) ||
    truncate(collection.seo?.description, 160) ||
    seoCopy.body;
  const image = collection.image?.url || null;

  return {
    ...criticalData,
    seo: {
      origin,
      path,
      title: collection.seo?.title || collection.title,
      description,
      image,
      imageAlt: collection.image?.altText || collection.title,
    },
    jsonLd: [
      buildCollectionJsonLd({
        origin,
        title: collection.title,
        description,
        path,
        image,
      }),
      buildBreadcrumbJsonLd(origin, [
        {name: 'Ana sayfa', path: '/'},
        {name: 'Koleksiyonlar', path: '/collections'},
        {name: collection.title, path},
      ]),
    ].filter(Boolean),
  };
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const url = new URL(request.url);
  const filters = getAppliedFilters(url.searchParams);
  const {sortKey, reverse} = getSortFromParam(url.searchParams);

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      filters,
      sortKey,
      reverse,
      ...paginationVariables,
    },
  });

  if (!collection) {
    throw new Response(`Koleksiyon bulunamadı: ${handle}`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

export default function Collection() {
  const {collection, jsonLd} = useLoaderData<typeof loader>();
  const filters = withoutBrandFilters(
    (collection.products.filters ?? []) as CollectionFilter[],
  );
  const products = collection.products.nodes as unknown as ProductCardProduct[];
  const productCountLabel = `${collection.products.nodes.length}${
    collection.products.pageInfo.hasNextPage ? '+' : ''
  } ürün`;

  return (
    <div className="collection-page">
      <JsonLd data={jsonLd} />
      <CollectionBanner />

      <div className="collection-page__inner">
        <h1 className="collection-page__title">{collection.title}</h1>

        <CollectionControls
          filters={filters}
          productCountLabel={productCountLabel}
        >
          <CollectionSort />
        </CollectionControls>

        <div className="collection-page__results">
          {products.length === 0 ? (
            <p className="collection-page__empty">
              Bu filtrelere uygun ürün bulunamadı.
            </p>
          ) : (
            <PaginatedResourceSection<ProductCardProduct>
              connection={
                collection.products as React.ComponentProps<
                  typeof PaginatedResourceSection<ProductCardProduct>
                >['connection']
              }
              resourcesClassName="collection-page__grid"
              ariaLabel={`${collection.title} ürünleri`}
            >
              {({node: product, index}) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : 'lazy'}
                />
              )}
            </PaginatedResourceSection>
          )}
        </div>

        <CollectionSeoContent
          handle={collection.handle}
          title={collection.title}
        />
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment CollectionProductCard on Product {
    id
    title
    handle
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      image {
        url
        altText
        width
        height
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...CollectionProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
