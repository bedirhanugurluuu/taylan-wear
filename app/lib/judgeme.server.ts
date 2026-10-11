type JudgemeEnv = {
  JUDGEME_SHOP_DOMAIN?: string;
  JUDGEME_PUBLIC_TOKEN?: string;
  JUDGEME_PRIVATE_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

export type JudgemeProductWidgets = {
  badgeHtml: string | null;
  widgetHtml: string | null;
};

function stripTempHiding(html: string) {
  return html
    .replace(/<style class=['"]jdgm-temp-hiding-style['"][^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\bjdgm-temp-hidden\b/g, '')
    .replace(/\sstyle=(['"])display:\s*none;?\1/gi, '');
}

async function fetchWidget(
  path: 'preview_badge' | 'product_review',
  env: JudgemeEnv,
  handle: string,
) {
  const shopDomain = env.JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;
  const token = env.JUDGEME_PUBLIC_TOKEN;
  if (!shopDomain || !token) return null;

  const url = new URL(`https://judge.me/api/v1/widgets/${path}`);
  url.searchParams.set('api_token', token);
  url.searchParams.set('shop_domain', shopDomain);
  url.searchParams.set('handle', handle);

  const response = await fetch(url.toString(), {
    headers: {Accept: 'application/json'},
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    badge?: string;
    widget?: string;
    error?: string;
  };

  if (data.error) return null;
  return path === 'preview_badge' ? data.badge || null : data.widget || null;
}

export async function fetchJudgemeProductWidgets(
  env: JudgemeEnv,
  handle: string,
): Promise<JudgemeProductWidgets> {
  try {
    const [badge, widget] = await Promise.all([
      fetchWidget('preview_badge', env, handle),
      fetchWidget('product_review', env, handle),
    ]);

    return {
      badgeHtml: badge ? stripTempHiding(badge) : null,
      widgetHtml: widget ? stripTempHiding(widget) : null,
    };
  } catch (error) {
    console.error('Judge.me widget fetch failed', error);
    return {badgeHtml: null, widgetHtml: null};
  }
}

function toShopifyProductId(productId: string) {
  return productId.replace('gid://shopify/Product/', '');
}

export async function createJudgemeReview(
  env: JudgemeEnv,
  input: {
    name: string;
    email: string;
    rating: number;
    title?: string;
    body: string;
    productId: string;
  },
): Promise<{ok: true} | {ok: false; error: string}> {
  const shopDomain = env.JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;
  const token = env.JUDGEME_PRIVATE_API_TOKEN;

  if (!shopDomain || !token) {
    return {ok: false, error: 'Judge.me yapılandırması eksik.'};
  }

  const url = new URL('https://judge.me/api/v1/reviews');
  url.searchParams.set('shop_domain', shopDomain);
  url.searchParams.set('api_token', token);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        rating: input.rating,
        title: input.title || undefined,
        body: input.body,
        platform: 'shopify',
        id: toShopifyProductId(input.productId),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Judge.me create review failed', response.status, text);
      return {
        ok: false,
        error: 'Yorum gönderilemedi. Lütfen tekrar dene.',
      };
    }

    return {ok: true};
  } catch (error) {
    console.error('Judge.me create review error', error);
    return {ok: false, error: 'Yorum gönderilemedi. Lütfen tekrar dene.'};
  }
}
