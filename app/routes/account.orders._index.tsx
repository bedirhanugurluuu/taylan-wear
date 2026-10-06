import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Taylan Wear | Siparişlerim'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Siparişler bulunamadı');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="account-orders">
      <h2 className="account-section__title">Siparişlerim</h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="account-orders__list" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="account-empty">
      {hasFilters ? (
        <>
          <p className="account-empty__text">
            Aramanıza uygun sipariş bulunamadı.
          </p>
          <Link to="/account/orders" className="account-btn account-btn--ghost">
            Filtreleri temizle
          </Link>
        </>
      ) : (
        <>
          <p className="account-empty__text">Henüz sipariş vermediniz.</p>
          <p className="account-empty__hint">
            Koleksiyonumuza göz atarak alışverişe başlayabilirsiniz.
          </p>
          <Link to="/collections/all" className="account-btn">
            Alışverişe başla
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label="Sipariş ara"
    >
      <fieldset className="order-search-fieldset">
        <legend className="order-search-legend">Sipariş filtrele</legend>

        <div className="order-search-inputs">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Sipariş no"
            aria-label="Sipariş numarası"
            defaultValue={currentFilters.name || ''}
            className="order-search-input"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Onay no"
            aria-label="Onay numarası"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="order-search-input"
          />
        </div>

        <div className="order-search-buttons">
          <button type="submit" className="account-btn" disabled={isSearching}>
            {isSearching ? 'Aranıyor…' : 'Ara'}
          </button>
          {hasFilters && (
            <button
              type="button"
              className="account-btn account-btn--ghost"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              Temizle
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;

  return (
    <article className="account-order-card">
      <div className="account-order-card__main">
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="account-order-card__number"
        >
          #{order.number}
        </Link>
        <p className="account-order-card__date">
          {formatOrderDate(order.processedAt)}
        </p>
        {order.confirmationNumber ? (
          <p className="account-order-card__meta">
            Onay: {order.confirmationNumber}
          </p>
        ) : null}
        <div className="account-order-card__status">
          {order.financialStatus ? <span>{order.financialStatus}</span> : null}
          {fulfillmentStatus ? <span>{fulfillmentStatus}</span> : null}
        </div>
      </div>
      <div className="account-order-card__aside">
        <p className="account-order-card__total">
          <Money data={order.totalPrice} />
        </p>
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="account-order-card__link"
        >
          Detayları gör
        </Link>
      </div>
    </article>
  );
}
