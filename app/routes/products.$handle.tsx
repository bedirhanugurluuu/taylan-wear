import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {ProductGallery} from '~/components/product/ProductGallery';
import {
  ProductInfoAccordion,
  ProductInfoModal,
  type ProductInfoTabId,
} from '~/components/product/ProductInfoModal';
import {RelatedProducts} from '~/components/product/RelatedProducts';
import {IconHeart} from '~/components/icons/HeaderIcons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_PAGE} from '~/lib/site-content';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Taylan Wear | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {
    ...criticalData,
    relatedProducts: loadRelatedProducts(args.context, criticalData.product.id),
  };
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

function loadRelatedProducts(
  context: Route.LoaderArgs['context'],
  productId: string,
) {
  return context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {productId},
    })
    .then(async (response) => {
      if (response?.productRecommendations?.length) return response;

      const fallback = await context.storefront.query(RELATED_FALLBACK_QUERY);
      return {
        productRecommendations: (fallback.products?.nodes ?? []).filter(
          (item: {id: string}) => item.id !== productId,
        ),
      };
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
}

function getMetafieldText(
  metafield: {value?: string | null} | null | undefined,
  fallback: string,
) {
  const value = metafield?.value?.trim();
  return value || fallback;
}

export default function Product() {
  const {product, relatedProducts} = useLoaderData<typeof loader>();
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<ProductInfoTabId>('details');

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title} = product;
  const images = product.images?.nodes ?? [];
  const collection = product.collections?.nodes?.[0];
  const viewAllHref = collection
    ? `/collections/${collection.handle}`
    : '/collections/all';

  const galleryImages =
    images.length > 0
      ? images
      : selectedVariant?.image
        ? [selectedVariant.image]
        : [];

  const infoContent = {
    details: getMetafieldText(
      product.details,
      product.descriptionHtml?.trim() || PRODUCT_PAGE.defaults.details,
    ),
    quality: getMetafieldText(product.quality, PRODUCT_PAGE.defaults.quality),
    fit: getMetafieldText(product.fit, PRODUCT_PAGE.defaults.fit),
  };

  const openInfo = (tab: ProductInfoTabId) => {
    setInfoTab(tab);
    setInfoOpen(true);
  };

  return (
    <div className="product-page">
      <div className="product-page__layout">
        <div className="product-page__gallery">
          <ProductGallery images={galleryImages} title={title} />
        </div>

        <div className="product-page__info">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Ana sayfa</Link>
            <span aria-hidden="true">/</span>
            {collection ? (
              <>
                <Link to={`/collections/${collection.handle}`}>
                  {collection.title}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <>
                <Link to="/collections/all">Katalog</Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span aria-current="page">{title}</span>
          </nav>

          <div className="product-page__heading">
            <h1 className="product-page__title">{title}</h1>
            <button
              type="button"
              className="product-page__wishlist"
              aria-label="Favorilere ekle"
            >
              <IconHeart size={22} />
            </button>
          </div>

          <div className="product-page__price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            onOpenInfo={openInfo}
          />

          <ProductInfoAccordion onOpen={openInfo} />
        </div>
      </div>

      <ProductInfoModal
        key={infoOpen ? infoTab : 'closed'}
        open={infoOpen}
        initialTab={infoTab}
        title={title}
        content={infoContent}
        onClose={() => setInfoOpen(false)}
      />

      <RelatedProducts products={relatedProducts} viewAllHref={viewAllHref} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    collections(first: 1) {
      nodes {
        handle
        title
      }
    }
    details: metafield(namespace: "custom", key: "details") {
      value
    }
    quality: metafield(namespace: "custom", key: "quality") {
      value
    }
    fit: metafield(namespace: "custom", key: "fit") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCT_CARD_FRAGMENT = `#graphql
  fragment RelatedProductCard on Product {
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

const RELATED_PRODUCTS_QUERY = `#graphql
  ${RELATED_PRODUCT_CARD_FRAGMENT}
  query RelatedProducts(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RelatedProductCard
    }
  }
` as const;

const RELATED_FALLBACK_QUERY = `#graphql
  ${RELATED_PRODUCT_CARD_FRAGMENT}
  query RelatedProductsFallback($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: BEST_SELLING) {
      nodes {
        ...RelatedProductCard
      }
    }
  }
` as const;
