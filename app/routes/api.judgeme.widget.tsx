import {fetchJudgemeWidgetPage} from '~/lib/judgeme.server';

type WidgetLoaderArgs = {
  request: Request;
  context: {env: Env};
};

export async function loader({request, context}: WidgetLoaderArgs) {
  const url = new URL(request.url);
  const handle = String(url.searchParams.get('handle') || '').trim();
  const page = Math.max(Number(url.searchParams.get('page') || 1), 1);

  if (!handle) {
    return Response.json({ok: false, error: 'handle required'}, {status: 400});
  }

  const result = await fetchJudgemeWidgetPage(context.env, handle, page);

  if (!result.html) {
    return Response.json(
      {ok: false, error: 'Widget yüklenemedi.'},
      {status: 502},
    );
  }

  return Response.json({
    ok: true,
    html: result.html,
    reviewCount: result.reviewCount,
    page,
  });
}
