import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {
  filterNewTaggedProducts,
  ProductRail,
} from '~/components/product/ProductRail';
import type {ProductCardProduct} from '~/components/product/ProductCard';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  featuredProducts?: Promise<{
    products: {nodes: ProductCardProduct[]};
  } | null>;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({
  layout,
  cart: originalCart,
  featuredProducts,
}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const {close} = useAside();

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const className = `cart-main${
    layout === 'aside' ? ' cart-main--aside' : ' cart-main--page'
  }`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Sepet sayfası' : 'Sepet'}
    >
      <CartEmpty
        hidden={linesCount}
        layout={layout}
        featuredProducts={featuredProducts}
      />
      <div className="cart-details" hidden={!linesCount}>
        <div className="cart-details__scroll">
          <p id="cart-lines" className="sr-only">
            Ürünler
          </p>
          <ul className="cart-lines" aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>

          {layout === 'aside' && featuredProducts ? (
            <AsideFeaturedRail
              featuredProducts={featuredProducts}
              title="Bunları da beğenebilirsin"
              onProductClick={close}
            />
          ) : null}
        </div>

        {cartHasItems ? <CartSummary cart={cart} layout={layout} /> : null}
      </div>
    </section>
  );
}

function CartEmpty({
  hidden = false,
  layout,
  featuredProducts,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
  featuredProducts?: CartMainProps['featuredProducts'];
}) {
  const {close} = useAside();
  return (
    <div className="cart-empty" hidden={hidden}>
      <div className="cart-empty__intro">
        <p className="cart-empty__text">Sepetin şu an boş.</p>
        <p className="cart-empty__hint">
          Beğendiğin parçaları ekleyerek alışverişe başlayabilirsin.
        </p>
        <Link
          className="cart-empty__cta"
          to="/collections/all"
          onClick={close}
          prefetch="viewport"
        >
          Alışverişe devam et
        </Link>
      </div>

      {layout === 'aside' && featuredProducts ? (
        <AsideFeaturedRail
          featuredProducts={featuredProducts}
          title="Bunları da beğenebilirsin"
          onProductClick={close}
        />
      ) : null}
    </div>
  );
}

function AsideFeaturedRail({
  featuredProducts,
  title,
  onProductClick,
}: {
  featuredProducts: NonNullable<CartMainProps['featuredProducts']>;
  title: string;
  onProductClick: () => void;
}) {
  return (
    <Suspense fallback={<div className="product-slider__loading product-slider__loading--aside" />}>
      <Await resolve={featuredProducts}>
        {(response) => {
          const products = filterNewTaggedProducts(
            (response?.products?.nodes ?? []) as ProductCardProduct[],
          );
          if (!products.length) return null;
          return (
            <ProductRail
              products={products}
              title={title}
              variant="aside"
              onProductClick={onProductClick}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
