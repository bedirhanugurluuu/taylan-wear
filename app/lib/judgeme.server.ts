type JudgemeEnv = {
  JUDGEME_SHOP_DOMAIN?: string;
  JUDGEME_PUBLIC_TOKEN?: string;
  JUDGEME_PRIVATE_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
};

export type JudgemeProductWidgets = {
  badgeHtml: string | null;
  widgetHtml: string | null;
  reviewCount: number;
  averageRating: number;
};

const JUDGEME_API = 'https://judge.me/api/v1';
const REVIEWS_PER_PAGE = 5;

function shopDomain(env: JudgemeEnv) {
  return env.JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN || '';
}

function stripTempHiding(html: string) {
  return html
    .replace(/<style class=['"]jdgm-temp-hiding-style['"][^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\bjdgm-temp-hidden\b/g, '')
    .replace(/\sstyle=(['"])display:\s*none;?\1/gi, '');
}

function parseReviewMeta(html: string | null) {
  if (!html) return {reviewCount: 0, averageRating: 0};

  const reviewCount = Number(
    html.match(/data-number-of-reviews=['"](\d+)['"]/i)?.[1] || 0,
  );
  const averageRating = Number(
    html.match(/data-average-rating=['"]([\d.]+)['"]/i)?.[1] || 0,
  );

  return {
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    averageRating: Number.isFinite(averageRating) ? averageRating : 0,
  };
}

function syncBadgeCount(html: string, reviewCount: number) {
  if (reviewCount <= 0) return html;

  return html
    .replace(
      /data-number-of-reviews=['"]\d+['"]/i,
      `data-number-of-reviews='${reviewCount}'`,
    )
    .replace(
      /(jdgm-prev-badge__text[^>]*>)([\s\S]*?)(<\/span>)/i,
      `$1 ${reviewCount} değerlendirme $3`,
    );
}

async function fetchWidget(
  path: 'preview_badge' | 'product_review',
  env: JudgemeEnv,
  handle: string,
  page = 1,
  perPage = REVIEWS_PER_PAGE,
) {
  const domain = shopDomain(env);
  const token = env.JUDGEME_PUBLIC_TOKEN;
  if (!domain || !token) return null;

  const url = new URL(`${JUDGEME_API}/widgets/${path}`);
  url.searchParams.set('api_token', token);
  url.searchParams.set('shop_domain', domain);
  url.searchParams.set('handle', handle);
  if (path === 'product_review') {
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
  }

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

async function fetchPublishedReviewCount(env: JudgemeEnv, handle: string) {
  const domain = shopDomain(env);
  const token = env.JUDGEME_PRIVATE_API_TOKEN || env.JUDGEME_PUBLIC_TOKEN;
  if (!domain || !token) return null;

  try {
    const productUrl = new URL(`${JUDGEME_API}/products/-1`);
    productUrl.searchParams.set('shop_domain', domain);
    productUrl.searchParams.set('api_token', token);
    productUrl.searchParams.set('handle', handle);

    const productRes = await fetch(productUrl.toString(), {
      headers: {Accept: 'application/json', 'X-Api-Token': token},
    });
    if (!productRes.ok) return null;

    const productData = (await productRes.json()) as {
      product?: {id?: number};
    };
    const productId = productData.product?.id;
    if (!productId) return null;

    const countUrl = new URL(`${JUDGEME_API}/reviews/count`);
    countUrl.searchParams.set('shop_domain', domain);
    countUrl.searchParams.set('api_token', token);
    countUrl.searchParams.set('product_id', String(productId));

    const countRes = await fetch(countUrl.toString(), {
      headers: {Accept: 'application/json', 'X-Api-Token': token},
    });
    if (!countRes.ok) return null;

    const countData = (await countRes.json()) as {count?: number};
    const count = Number(countData.count);
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

export async function fetchJudgemeProductWidgets(
  env: JudgemeEnv,
  handle: string,
): Promise<JudgemeProductWidgets> {
  try {
    const [badge, widget, apiCount] = await Promise.all([
      fetchWidget('preview_badge', env, handle),
      fetchWidget('product_review', env, handle, 1),
      fetchPublishedReviewCount(env, handle),
    ]);

    // Badge HTML can lag behind; prefer reviews/count, then widget meta.
    const badgeMeta = parseReviewMeta(badge);
    const widgetMeta = parseReviewMeta(widget);
    const reviewCount = Math.max(
      apiCount ?? 0,
      widgetMeta.reviewCount,
      badgeMeta.reviewCount,
    );
    const averageRating =
      widgetMeta.averageRating || badgeMeta.averageRating || 0;
    const cleanedBadge = badge
      ? syncBadgeCount(stripTempHiding(badge), reviewCount)
      : null;

    return {
      badgeHtml: reviewCount > 0 ? cleanedBadge : null,
      widgetHtml: widget ? stripTempHiding(widget) : null,
      reviewCount,
      averageRating,
    };
  } catch (error) {
    console.error('Judge.me widget fetch failed', error);
    return {
      badgeHtml: null,
      widgetHtml: null,
      reviewCount: 0,
      averageRating: 0,
    };
  }
}

export async function fetchJudgemeWidgetPage(
  env: JudgemeEnv,
  handle: string,
  page: number,
  perPage = REVIEWS_PER_PAGE,
): Promise<{html: string | null; reviewCount: number}> {
  try {
    const widget = await fetchWidget(
      'product_review',
      env,
      handle,
      Math.max(1, page),
      perPage,
    );
    const meta = parseReviewMeta(widget);
    return {
      html: widget ? stripTempHiding(widget) : null,
      reviewCount: meta.reviewCount,
    };
  } catch (error) {
    console.error('Judge.me widget page fetch failed', error);
    return {html: null, reviewCount: 0};
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
  const domain = shopDomain(env);
  const token = env.JUDGEME_PRIVATE_API_TOKEN;

  if (!domain || !token) {
    return {ok: false, error: 'Judge.me yapılandırması eksik.'};
  }

  const url = new URL(`${JUDGEME_API}/reviews`);
  url.searchParams.set('shop_domain', domain);
  url.searchParams.set('api_token', token);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Token': token,
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

    const text = await response.text();
    let data: {
      id?: number;
      review?: {id?: number};
      message?: string;
      error?: string;
    } | null = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const reviewId = data?.id ?? data?.review?.id;
    const created =
      response.ok ||
      Boolean(reviewId) ||
      /processed in background|created shortly/i.test(text) ||
      (response.status === 422 && /already|duplicate|exists/i.test(text));

    if (!created) {
      console.error('Judge.me create review failed', response.status, text);
      return {
        ok: false,
        error: 'Yorum gönderilemedi. Lütfen tekrar dene.',
      };
    }

    // Moderation is handled in Judge.me (manual approve). Return immediately.
    return {ok: true};
  } catch (error) {
    console.error('Judge.me create review error', error);
    return {ok: false, error: 'Yorum gönderilemedi. Lütfen tekrar dene.'};
  }
}

export {REVIEWS_PER_PAGE};
