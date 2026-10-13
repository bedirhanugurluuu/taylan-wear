export const CUSTOMER_PURCHASED_PRODUCT_QUERY = `#graphql
  query CustomerPurchasedProduct($first: Int = 50) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          lineItems(first: 50) {
            nodes {
              productId
            }
          }
        }
      }
    }
  }
` as const;
