import type {ReactNode} from 'react';
import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Link,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {HEADER_QUERY} from '~/lib/fragments';
import {
  FEATURED_PRODUCTS_QUERY,
  NEW_PRODUCTS_QUERY,
} from '~/lib/product-queries';
import resetStylesInline from '~/styles/reset.css?inline';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * Stylesheets live in links() (Hydrogen default). Critical reset/shell CSS is
 * inlined in Layout without a nonce so SSR/client <head> trees match.
 */
export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {rel: 'stylesheet', href: tailwindCss},
    {rel: 'stylesheet', href: appStyles},
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=optional',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      // Local/mock shops often omit PUBLIC_CHECKOUT_DOMAIN; store domain is enough
      // for Analytics.Provider to initialize without throwing.
      checkoutDomain:
        env.PUBLIC_CHECKOUT_DOMAIN || env.PUBLIC_STORE_DOMAIN || '',
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const header = await storefront.query(HEADER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      headerMenuHandle: 'main-menu', // Adjust to your header menu handle
    },
  });

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {customerAccount, cart, storefront} = context;

  const featuredProducts = storefront
    .query(FEATURED_PRODUCTS_QUERY)
    .then(async (data) => {
      if (data?.products?.nodes?.length) return data;
      return storefront.query(NEW_PRODUCTS_QUERY);
    })
    .catch((error: Error) => {
      console.error(error);
      return storefront.query(NEW_PRODUCTS_QUERY).catch(() => null);
    });

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    featuredProducts,
  };
}

export function Layout({children}: {children?: ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/*
          Critical CSS after Meta/Links keeps hydrate order stable.
          No nonce — empty client nonce vs SSR nonce was desyncing <head>.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `${resetStylesInline}
              :root{--header-height:64px;--top-bar-height:34px;--font-body:'Inter',system-ui,-apple-system,sans-serif;--color-dark:#000;--color-light:#fff}
              html,body{margin:0;background:#fff;color:#000;font-family:var(--font-body)}
              main{flex:1;min-width:0}
              .site-header{position:sticky;top:0;z-index:50}
              .top-bar{background:#000;color:#fff;min-height:var(--top-bar-height);font-size:.6875rem;letter-spacing:.06em;text-transform:uppercase;line-height:1.3}
              .top-bar__inner{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center;min-height:var(--top-bar-height);padding:.4rem 1rem;max-width:100%}
              .top-bar__left{display:none}.top-bar__right{text-align:center;grid-column:1/-1}
              .top-bar__link{color:inherit;text-decoration:none}
              .header{position:relative;display:flex;flex-direction:column;background:#fff;color:#000}
              .header__bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:var(--header-height);padding:0 1rem}
              .header__brand{display:flex;align-items:center;gap:1.25rem;min-width:0}
              .header__logo{color:inherit;text-decoration:none;font-size:1rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
              .header__actions{display:flex;align-items:center;gap:.35rem;margin-left:auto}
              .header__icon-btn{display:inline-flex;align-items:center;justify-content:center;width:2.5rem;height:2.5rem;padding:0;border:0;background:transparent;color:inherit;cursor:pointer}
              .header-menu--desktop{display:none}
              .header-menu__item{color:inherit;text-decoration:none;font-size:.8125rem;font-weight:500;letter-spacing:.04em;text-transform:uppercase}
              .footer{margin-top:auto;background:#111;color:#fff}
              .product-page__layout{display:grid;grid-template-columns:1fr;gap:1.25rem}
              .product-gallery--grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
              .product-gallery--desktop{display:none}
              .product-gallery-mobile{display:block}
              .product-gallery__item{aspect-ratio:4/5;overflow:hidden;background:#f2f2f2}
              .product-gallery__item img{width:100%;height:100%;object-fit:cover;display:block}
              @media(min-width:768px){
                .top-bar__inner{padding-inline:1.5rem}
                .top-bar__left{display:block}.top-bar__right{text-align:right;grid-column:auto}
                .header__bar{padding-inline:1.5rem}
                .header-menu--desktop{display:flex;align-items:center;gap:1.25rem}
                .header__menu-toggle{display:none}
              }
              @media(min-width:1024px){
                .product-page__layout{grid-template-columns:repeat(24,1fr);gap:0;align-items:start}
                .product-page__gallery{grid-column:span 16}
                .product-page__info{grid-column:span 8}
                .product-gallery--desktop{display:grid}
                .product-gallery-mobile{display:none}
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function AppShell({
  data,
  children,
}: {
  data: NonNullable<ReturnType<typeof useRouteLoaderData<RootLoader>>>;
  children: ReactNode;
}) {
  const canUseAnalytics = Boolean(data.consent?.checkoutDomain);

  const shell = <PageLayout {...data}>{children}</PageLayout>;

  if (!canUseAnalytics) return shell;

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      {shell}
    </Analytics.Provider>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <AppShell data={data}>
      <Outlet />
    </AppShell>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<RootLoader>('root');
  let errorStatus = 500;
  let isNotFound = false;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    isNotFound = error.status === 404;
  }

  const content = (
    <div className="route-error">
      <p className="route-error__code">{errorStatus}</p>
      <h1 className="route-error__title">
        {isNotFound ? 'Sayfa bulunamadı' : 'Bir şeyler ters gitti'}
      </h1>
      <p className="route-error__text">
        {isNotFound
          ? 'Aradığın sayfa taşınmış veya hiç var olmamış olabilir.'
          : 'Beklenmeyen bir hata oluştu. Ana sayfaya dönüp tekrar deneyebilirsin.'}
      </p>
      <Link className="route-error__cta" to="/">
        Ana sayfaya dön
      </Link>
    </div>
  );

  if (!data) {
    return content;
  }

  return <AppShell data={data}>{content}</AppShell>;
}
