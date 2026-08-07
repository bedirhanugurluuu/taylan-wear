import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
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
import resetStyles from '~/styles/reset.css?url';
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
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    // Preload local CSS early so navigations / remounts reapply faster
    {rel: 'preload', as: 'style', href: tailwindCss},
    {rel: 'preload', as: 'style', href: resetStyles},
    {rel: 'preload', as: 'style', href: appStyles},
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
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
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

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/*
          Critical shell styles stay inlined so a brief stylesheet remount
          (FOUC on nav / StrictMode / HMR) never shows a naked HTML skeleton.
        */}
        <style
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              :root{--header-height:64px;--top-bar-height:34px;--font-body:system-ui,-apple-system,sans-serif}
              html,body{margin:0;background:#fff;color:#000;font-family:var(--font-body)}
              .site-header{position:sticky;top:0;z-index:50}
              .top-bar{background:#000;color:#fff;min-height:var(--top-bar-height);font-size:.6875rem;letter-spacing:.06em;text-transform:uppercase}
              .top-bar__inner{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center;min-height:var(--top-bar-height);padding:.4rem 1rem}
              .top-bar__left{display:none}.top-bar__right{text-align:center;grid-column:1/-1}
              .header{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:var(--header-height);padding:0 1rem;background:#fff;color:#000}
              .header__logo{color:inherit;text-decoration:none;font-size:1rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
              .header__actions{display:flex;align-items:center;gap:.35rem;margin-left:auto}
              .header-menu--desktop{display:none}
              @media(min-width:768px){
                .top-bar__left{display:block}.top-bar__right{text-align:right;grid-column:auto}
                .header-menu--desktop{display:flex}.header__menu-toggle{display:none}
              }
            `,
          }}
        />
        {/* Stylesheets before Meta/Links so the browser discovers them first in the stream */}
        <link rel="stylesheet" href={tailwindCss} />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorStatus = 500;
  let isNotFound = false;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    isNotFound = error.status === 404;
  }

  return (
    <div className="route-error">
      <p className="route-error__brand">Taylan Wear</p>
      <p className="route-error__code">{errorStatus}</p>
      <h1 className="route-error__title">
        {isNotFound ? 'Sayfa bulunamadı' : 'Bir şeyler ters gitti'}
      </h1>
      <p className="route-error__text">
        {isNotFound
          ? 'Aradığın sayfa taşınmış veya hiç var olmamış olabilir.'
          : 'Beklenmeyen bir hata oluştu. Ana sayfaya dönüp tekrar deneyebilirsin.'}
      </p>
      <a className="route-error__cta" href="/">
        Ana sayfaya dön
      </a>
    </div>
  );
}
