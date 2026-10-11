import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Custom lists replace Hydrogen defaults — keep Shopify/Vite + Judge.me.
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cache.judge.me',
      'https://judge.me',
    ],
    styleSrc: [
      'https://fonts.googleapis.com',
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://judge.me',
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
    ],
    connectSrc: [
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cache.judge.me',
      'https://judge.me',
      'https://api.judge.me',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://images.unsplash.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://judge.me',
      'https://cache.judge.me',
    ],
    frameSrc: [
      'https://judge.me',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cache.judge.me',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
