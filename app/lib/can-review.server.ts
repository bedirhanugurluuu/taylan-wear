import {CUSTOMER_PURCHASED_PRODUCT_QUERY} from '~/graphql/customer-account/CustomerPurchasedProductQuery';

type CustomerAccountClient = {
  isLoggedIn: () => Promise<boolean>;
  query: (
    query: string,
    options?: {variables?: Record<string, unknown>},
  ) => Promise<{
    data?: {
      customer?: {
        orders?: {
          nodes?: Array<{
            lineItems?: {
              nodes?: Array<{productId?: string | null}>;
            };
          }>;
        };
      };
    } | null;
    errors?: Array<{message?: string}> | null;
  }>;
};

function productIdsMatch(orderedProductId: string, targetProductId: string) {
  if (orderedProductId === targetProductId) return true;

  const orderedNumeric = orderedProductId.replace(/\D/g, '');
  const targetNumeric = targetProductId.replace(/\D/g, '');

  return Boolean(
    orderedNumeric &&
      targetNumeric &&
      orderedNumeric === targetNumeric,
  );
}

/**
 * Review form is only for logged-in customers who already bought the product.
 */
export async function canCustomerReviewProduct(
  customerAccount: CustomerAccountClient,
  productId: string,
): Promise<boolean> {
  if (!productId) return false;

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) return false;

    const {data, errors} = await customerAccount.query(
      CUSTOMER_PURCHASED_PRODUCT_QUERY,
      {variables: {first: 50}},
    );

    if (errors?.length || !data?.customer?.orders?.nodes) return false;

    return data.customer.orders.nodes.some((order) =>
      (order.lineItems?.nodes || []).some((item) => {
        const orderedProductId = item.productId;
        return (
          Boolean(orderedProductId) &&
          productIdsMatch(orderedProductId!, productId)
        );
      }),
    );
  } catch (error) {
    console.error('Purchase check for review failed', error);
    return false;
  }
}
