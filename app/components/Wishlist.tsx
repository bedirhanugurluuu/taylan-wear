import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useAside} from '~/components/Aside';
import {IconWishlist} from '~/components/icons/HeaderIcons';
import {useWishlist} from '~/components/WishlistProvider';
import type {WishlistProductInput} from '~/lib/wishlist';

export function WishlistToggleButton({
  product,
  className,
  size = 16,
  labelAdd = 'Favorilere ekle',
  labelRemove = 'Favorilerden çıkar',
  stopPropagation = false,
}: {
  product: WishlistProductInput;
  className?: string;
  size?: number;
  labelAdd?: string;
  labelRemove?: string;
  stopPropagation?: boolean;
}) {
  const {has, toggle, ready} = useWishlist();
  const saved = ready && has(product.id);

  return (
    <button
      type="button"
      className={`${className ?? ''}${saved ? ' is-saved' : ''}`.trim()}
      aria-label={saved ? labelRemove : labelAdd}
      aria-pressed={saved}
      disabled={!ready}
      onClick={(event) => {
        if (stopPropagation) {
          event.preventDefault();
          event.stopPropagation();
        }
        toggle(product);
      }}
    >
      <IconWishlist size={size} filled={saved} />
    </button>
  );
}

export function WishlistAsideContent() {
  const {items, remove, clear} = useWishlist();
  const {close} = useAside();

  if (!items.length) {
    return (
      <div className="wishlist-empty">
        <p className="wishlist-empty__text">Henüz favori ürününüz yok.</p>
        <p className="wishlist-empty__hint">
          Beğendiğiniz ürünleri kaydedin, sonra buradan kolayca ulaşın.
        </p>
        <Link to="/collections/all" className="account-btn" onClick={close}>
          Alışverişe başla
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-aside">
      <ul className="wishlist-aside__list">
        {items.map((item) => (
          <li key={item.productId} className="wishlist-aside__item">
            <Link
              to={`/products/${item.handle}`}
              className="wishlist-aside__media"
              prefetch="intent"
              onClick={close}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title}
                  width={88}
                  height={110}
                  loading="lazy"
                />
              ) : (
                <span className="wishlist-aside__media-fallback" />
              )}
            </Link>

            <div className="wishlist-aside__info">
              <Link
                to={`/products/${item.handle}`}
                className="wishlist-aside__title"
                prefetch="intent"
                onClick={close}
              >
                {item.title}
              </Link>
              {item.priceAmount && item.priceCurrencyCode ? (
                <p className="wishlist-aside__price">
                  <Money
                    data={{
                      amount: item.priceAmount,
                      currencyCode: item.priceCurrencyCode as CurrencyCode,
                    }}
                  />
                </p>
              ) : null}
              <button
                type="button"
                className="wishlist-aside__remove"
                onClick={() => remove(item.productId)}
              >
                Kaldır
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="wishlist-aside__footer">
        <button
          type="button"
          className="account-btn account-btn--ghost"
          onClick={clear}
        >
          Listeyi temizle
        </button>
      </div>
    </div>
  );
}

export function HeaderWishlistButton() {
  const {open} = useAside();
  const {count, ready} = useWishlist();

  return (
    <button
      type="button"
      className="header__icon-btn reset"
      onClick={() => open('wishlist')}
      aria-label={ready && count > 0 ? `Favoriler (${count})` : 'Favoriler'}
    >
      <IconWishlist />
      {ready && count > 0 ? (
        <span className="header__cart-count">{count}</span>
      ) : null}
    </button>
  );
}
