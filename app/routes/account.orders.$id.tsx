import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Taylan Wear | Sipariş ${data?.order?.name ?? ''}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Sipariş bulunamadı');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? '—';
  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();

  return (
    <div className="account-order">
      <Link to="/account/orders" className="account-order__back">
        ← Siparişlere dön
      </Link>
      <h2 className="account-section__title">Sipariş {order.name}</h2>
      <p className="account-order__meta">
        {formatOrderDate(order.processedAt!)}
        {order.confirmationNumber
          ? ` · Onay: ${order.confirmationNumber}`
          : null}
      </p>

      <div className="account-order__table-wrap">
        <table className="account-order__table">
          <thead>
            <tr>
              <th scope="col">Ürün</th>
              <th scope="col">Fiyat</th>
              <th scope="col">Adet</th>
              <th scope="col">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3}>
                  İndirim
                </th>
                <td>
                  {discountPercentage ? (
                    <span>-%{discountPercentage}</span>
                  ) : (
                    discountValue && <Money data={discountValue!} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3}>
                Ara toplam
              </th>
              <td>
                <Money data={order.subtotal!} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3}>
                Vergi
              </th>
              <td>
                <Money data={order.totalTax!} />
              </td>
            </tr>
            <tr className="account-order__total-row">
              <th scope="row" colSpan={3}>
                Genel toplam
              </th>
              <td>
                <Money data={order.totalPrice!} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="account-order__grid">
        <div>
          <h3 className="account-order__subtitle">Teslimat adresi</h3>
          {order?.shippingAddress ? (
            <address className="account-order__address">
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : null}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : null}
            </address>
          ) : (
            <p>Teslimat adresi tanımlı değil.</p>
          )}
        </div>
        <div>
          <h3 className="account-order__subtitle">Durum</h3>
          <p className="account-order__status">{fulfillmentStatus}</p>
        </div>
      </div>

      <p>
        <a
          className="account-btn account-btn--ghost"
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
        >
          Sipariş durumunu görüntüle
        </a>
      </p>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr>
      <td>
        <div className="account-order__product">
          {lineItem?.image ? (
            <Image
              data={lineItem.image}
              width={72}
              height={90}
              className="account-order__product-img"
            />
          ) : null}
          <div>
            <p className="account-order__product-title">{lineItem.title}</p>
            {lineItem.variantTitle ? (
              <small className="account-order__product-variant">
                {lineItem.variantTitle}
              </small>
            ) : null}
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price!} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalDiscount!} />
      </td>
    </tr>
  );
}
