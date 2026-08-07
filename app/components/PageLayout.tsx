import {Await, Link} from 'react-router';
import {Suspense, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {TopBar} from '~/components/layout/TopBar';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {
  filterNewTaggedProducts,
  ProductRail,
} from '~/components/product/ProductRail';
import type {ProductCardProduct} from '~/components/product/ProductCard';

type FeaturedProductsPromise = Promise<{
  products: {nodes: ProductCardProduct[]};
} | null>;

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  featuredProducts?: FeaturedProductsPromise;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  header,
  isLoggedIn,
  publicStoreDomain,
  featuredProducts,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} featuredProducts={featuredProducts} />
      <SearchAside featuredProducts={featuredProducts} />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      <div className="site-header">
        <TopBar />
        {header ? (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        ) : null}
      </div>
      <main>{children}</main>
      <Footer />
    </Aside.Provider>
  );
}

function CartAside({
  cart,
  featuredProducts,
}: {
  cart: PageLayoutProps['cart'];
  featuredProducts?: FeaturedProductsPromise;
}) {
  return (
    <Aside type="cart" heading="Sepet">
      <Suspense fallback={<p className="aside-panel__loading">Yükleniyor…</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return (
              <CartMain
                cart={cart}
                layout="aside"
                featuredProducts={featuredProducts}
              />
            );
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside({
  featuredProducts,
}: {
  featuredProducts?: FeaturedProductsPromise;
}) {
  const queriesDatalistId = useId();
  const {close} = useAside();
  const [query, setQuery] = useState('');

  return (
    <Aside type="search" heading="Ara">
      <div className="predictive-search">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="predictive-search__form">
              <input
                className="predictive-search__input"
                name="q"
                onChange={(event) => {
                  setQuery(event.target.value);
                  fetchResults(event);
                }}
                onFocus={fetchResults}
                placeholder="Ürün, kategori ara…"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                autoComplete="off"
              />
              <button
                type="button"
                className="predictive-search__submit"
                onClick={goToSearch}
              >
                Ara
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;
            const hasTerm = Boolean(query.trim());

            if (state === 'loading' && hasTerm) {
              return <p className="aside-panel__loading">Aranıyor…</p>;
            }

            if (!hasTerm) {
              return featuredProducts ? (
                <div className="predictive-search__idle">
                  <Suspense
                    fallback={
                      <div className="product-slider__loading product-slider__loading--aside" />
                    }
                  >
                    <Await resolve={featuredProducts}>
                      {(response) => {
                        const nodes = filterNewTaggedProducts(
                          (response?.products?.nodes ??
                            []) as ProductCardProduct[],
                        );
                        if (!nodes.length) {
                          return (
                            <p className="predictive-search__empty">
                              Aramak istediğin ürünü yaz.
                            </p>
                          );
                        }
                        return (
                          <ProductRail
                            products={nodes}
                            title="Bu haftanın yeni ürünleri"
                            variant="aside"
                            onProductClick={close}
                          />
                        );
                      }}
                    </Await>
                  </Suspense>
                </div>
              ) : (
                <p className="predictive-search__empty">
                  Aramak istediğin ürünü yaz.
                </p>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div className="predictive-search__results">
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    className="predictive-search__view-all"
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    “{term.current}” için tüm sonuçlar
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="Menü">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
