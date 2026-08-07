import {Link} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {
  ProductCard,
  type ProductCardProduct,
} from '~/components/product/ProductCard';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="search-result">
      <h2 className="search-result__title">Yazılar</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="search-result">
      <h2 className="search-result__title">Sayfalar</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsProducts({
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="search-result">
      <h2 className="search-result__title">Ürünler</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => (
          <div>
            <div className="search-result__pager">
              <PreviousLink>
                {isLoading ? 'Yükleniyor…' : 'Önceki'}
              </PreviousLink>
            </div>
            <div className="search-result__grid">
              {nodes.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as unknown as ProductCardProduct}
                />
              ))}
            </div>
            <div className="search-result__pager">
              <NextLink>
                {isLoading ? 'Yükleniyor…' : 'Daha fazla'}
              </NextLink>
            </div>
          </div>
        )}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="search-page__empty">
      Sonuç bulunamadı. Farklı bir arama deneyebilirsin.
    </p>
  );
}
