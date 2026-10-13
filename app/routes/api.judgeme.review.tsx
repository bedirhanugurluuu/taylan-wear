import {canCustomerReviewProduct} from '~/lib/can-review.server';
import {createJudgemeReview} from '~/lib/judgeme.server';
import {
  assertReviewRateLimit,
  getReviewClientKey,
} from '~/lib/review-rate-limit.server';

type ReviewActionArgs = {
  request: Request;
  context: {
    env: Env;
    customerAccount: {
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
  };
};

const MIN_FORM_MS = 1200;

export async function loader() {
  return Response.json({ok: false, error: 'Method not allowed'}, {status: 405});
}

export async function action({request, context}: ReviewActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();
  const honeypot = String(form.get('website') || '').trim();
  if (honeypot) {
    // Pretend success to bots
    return Response.json({
      ok: true,
      message:
        'Yorumun gönderildi. Onaylandıktan sonra burada görünecek.',
    });
  }

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  const title = String(form.get('title') || '').trim();
  const body = String(form.get('body') || '').trim();
  const rating = Number(form.get('rating') || 0);
  const productId = String(form.get('productId') || '').trim();
  const startedAt = Number(form.get('startedAt') || 0);

  if (
    !name ||
    !email ||
    !body ||
    !productId ||
    rating < 1 ||
    rating > 5 ||
    name.length > 80 ||
    email.length > 120 ||
    title.length > 120 ||
    body.length < 10 ||
    body.length > 2000
  ) {
    return Response.json(
      {ok: false, error: 'Lütfen tüm alanları doğru doldur.'},
      {status: 400},
    );
  }

  const canReview = await canCustomerReviewProduct(
    context.customerAccount,
    productId,
  );
  if (!canReview) {
    return Response.json(
      {
        ok: false,
        error:
          'Yorum yazmak için giriş yapmış olmalı ve bu ürünü satın almış olmalısın.',
      },
      {status: 403},
    );
  }

  if (!startedAt || Date.now() - startedAt < MIN_FORM_MS) {
    return Response.json(
      {ok: false, error: 'Çok hızlı gönderim yaptın. Lütfen tekrar dene.'},
      {status: 429},
    );
  }

  const rate = assertReviewRateLimit(getReviewClientKey(request));
  if (!rate.ok) {
    return Response.json({ok: false, error: rate.error}, {status: 429});
  }

  const result = await createJudgemeReview(context.env, {
    name,
    email,
    title,
    body,
    rating,
    productId,
  });

  if (!result.ok) {
    return Response.json(
      {ok: false, error: result.error || 'Yorum gönderilemedi.'},
      {status: 502},
    );
  }

  return Response.json({
    ok: true,
    message:
      'Yorumun gönderildi. Onaylandıktan sonra burada görünecek.',
  });
}
