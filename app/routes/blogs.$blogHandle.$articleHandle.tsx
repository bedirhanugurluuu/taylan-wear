import {useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {JsonLd} from '~/components/seo/JsonLd';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildSeoMeta,
  originFromRequest,
  stripHtml,
  truncate,
} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  return buildSeoMeta(data?.seo);
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const origin = originFromRequest(args.request);
  const {article, blogHandle} = criticalData;
  const path = `/blogs/${blogHandle}/${article.handle}`;
  const description =
    article.seo?.description ||
    truncate(stripHtml(article.contentHtml), 160) ||
    article.title;

  return {
    ...deferredData,
    ...criticalData,
    seo: {
      origin,
      path,
      title: article.seo?.title || article.title,
      description,
      image: article.image?.url,
      imageAlt: article.image?.altText || article.title,
      type: 'article' as const,
    },
    jsonLd: [
      buildArticleJsonLd({
        origin,
        title: article.title,
        description,
        path,
        image: article.image?.url,
        publishedAt: article.publishedAt,
        author: article.author?.name,
      }),
      buildBreadcrumbJsonLd(origin, [
        {name: 'Ana sayfa', path: '/'},
        {name: 'Blog', path: `/blogs/${blogHandle}`},
        {name: article.title, path},
      ]),
    ].filter(Boolean),
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Yazı bulunamadı', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article, blogHandle};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Article() {
  const {article, jsonLd} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <article className="article">
      <JsonLd data={jsonLd} />
      <header>
        <h1>{title}</h1>
        <p>
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {author?.name ? (
            <>
              {' '}
              &middot; <span>{author.name}</span>
            </>
          ) : null}
        </p>
      </header>

      {image && <Image data={image} sizes="90vw" loading="eager" />}
      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="article__body"
      />
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
