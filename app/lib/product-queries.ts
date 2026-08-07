/**
 * Shared product card GraphQL fragment + new-products query.
 */
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCardFields on Product {
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

/** Prefer products tagged yeni/new; used in search + cart asides */
export const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(
      first: 12
      sortKey: CREATED_AT
      reverse: true
      query: "tag:yeni OR tag:new"
    ) {
      nodes {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

/** Homepage fallback: newest products (badge still driven by tags) */
export const NEW_PRODUCTS_QUERY = `#graphql
  query NewProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
