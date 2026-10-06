import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {useWishlist} from '~/components/WishlistProvider';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

const COLOR_NAMES = ['renk', 'color', 'colour'];
const SIZE_NAMES = ['beden', 'size', 'ölçü', 'olcu'];

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise, quantity} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  const color = selectedOptions.find((option) =>
    COLOR_NAMES.includes(option.name.trim().toLowerCase()),
  )?.value;
  const size = selectedOptions.find((option) =>
    SIZE_NAMES.includes(option.name.trim().toLowerCase()),
  )?.value;
  const otherOptions = selectedOptions.filter((option) => {
    const name = option.name.trim().toLowerCase();
    return !COLOR_NAMES.includes(name) && !SIZE_NAMES.includes(name);
  });

  const unitPrice = line?.cost?.amountPerQuantity;
  const closeIfAside = () => {
    if (layout === 'aside') close();
  };

  if (layout === 'aside') {
    return (
      <li key={id} className="cart-line cart-line--aside">
        <div className="cart-line-inner">
          {image ? (
            <Link
              className="cart-line__media"
              prefetch="intent"
              to={lineItemUrl}
              onClick={closeIfAside}
            >
              <Image
                alt={title}
                aspectRatio="4/5"
                data={image}
                height={140}
                loading="lazy"
                width={112}
              />
            </Link>
          ) : null}

          <div className="cart-line__info">
            <Link
              className="cart-line__title"
              prefetch="intent"
              to={lineItemUrl}
              onClick={closeIfAside}
            >
              {product.title}
            </Link>

            <p className="cart-line__meta">
              {unitPrice ? <Money data={unitPrice} /> : null}
              <span aria-hidden="true"> · </span>
              <span>{quantity} adet</span>
            </p>

            {(color || size || otherOptions.length > 0) && (
              <ul className="cart-line__options">
                {color ? <li>Renk: {color}</li> : null}
                {size ? <li>Beden: {size}</li> : null}
                {otherOptions.map((option) => (
                  <li key={option.name}>
                    {option.name}: {option.value}
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-line__actions">
              <CartWishlistButton
                productId={product.id}
                handle={product.handle}
                title={product.title}
                image={image}
                price={unitPrice}
              />
              <CartLineRemoveButton
                lineIds={[id]}
                disabled={!!line.isOptimistic}
                label="Kaldır"
              />
            </div>
          </div>
        </div>

        {lineItemChildren ? (
          <div>
            <p id={childrenLabelId} className="sr-only">
              {product.title} alt ürünleri
            </p>
            <ul aria-labelledby={childrenLabelId} className="cart-line-children">
              {lineItemChildren.map((childLine) => (
                <CartLineItem
                  childrenMap={childrenMap}
                  key={childLine.id}
                  line={childLine}
                  layout={layout}
                />
              ))}
            </ul>
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner">
        {image ? (
          <Link
            className="cart-line__media"
            prefetch="intent"
            to={lineItemUrl}
            onClick={closeIfAside}
          >
            <Image
              alt={title}
              aspectRatio="4/5"
              data={image}
              height={120}
              loading="lazy"
              width={96}
            />
          </Link>
        ) : null}

        <div className="cart-line__info">
          <Link
            className="cart-line__title"
            prefetch="intent"
            to={lineItemUrl}
            onClick={closeIfAside}
          >
            {product.title}
          </Link>
          <div className="cart-line__price">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          {selectedOptions.length > 0 ? (
            <ul className="cart-line__options">
              {selectedOptions.map((option) => (
                <li key={option.name}>
                  {option.name}: {option.value}
                </li>
              ))}
            </ul>
          ) : null}
          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            {product.title} alt ürünleri
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartWishlistButton({
  productId,
  handle,
  title,
  image,
  price,
}: {
  productId: string;
  handle: string;
  title: string;
  image?: CartLine['merchandise']['image'];
  price?: CartLine['cost']['amountPerQuantity'];
}) {
  const {has, toggle, ready} = useWishlist();
  const saved = ready && has(productId);

  return (
    <button
      type="button"
      className={`cart-line__wishlist${saved ? ' is-saved' : ''}`}
      disabled={!ready}
      onClick={() =>
        toggle({
          id: productId,
          handle,
          title,
          image: image
            ? {url: image.url, altText: image.altText}
            : null,
          price: price
            ? {amount: price.amount, currencyCode: price.currencyCode}
            : null,
        })
      }
    >
      {saved ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    </button>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          type="submit"
          className="cart-line-quantity__btn"
          aria-label="Azalt"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          −
        </button>
      </CartLineUpdateButton>
      <span className="cart-line-quantity__value">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          type="submit"
          className="cart-line-quantity__btn"
          aria-label="Artır"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          +
        </button>
      </CartLineUpdateButton>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
  label = 'Kaldır',
}: {
  lineIds: string[];
  disabled: boolean;
  label?: string;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="cart-line__remove" disabled={disabled} type="submit">
        {label}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
