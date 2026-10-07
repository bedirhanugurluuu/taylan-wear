import {Suspense, useEffect, useMemo, useState} from 'react';
import {
  Await,
  NavLink,
  useAsyncValue,
  useLocation,
} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {
  IconCart,
  IconMenu,
  IconSearch,
  IconUser,
} from '~/components/icons/HeaderIcons';
import {HeaderWishlistButton} from '~/components/Wishlist';
import {CATEGORIES, HEADER_NAV} from '~/lib/site-content';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

type NavLinkItem = {
  label: string;
  href: string;
  image?: string | null;
};

type NavItem = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  links: NavLinkItem[] | null;
};

function toPathname(
  url: string | null | undefined,
  publicStoreDomain: string,
  primaryDomainUrl: string,
) {
  if (!url) return '/';

  if (
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl)
  ) {
    return new URL(url).pathname;
  }

  return url;
}

function imageForHref(href: string, fallback?: string | null) {
  const match = CATEGORIES.find((item) => item.href === href);
  return match?.image ?? fallback ?? null;
}

export function buildNavItems({
  menu,
  publicStoreDomain,
  primaryDomainUrl,
}: {
  menu: HeaderProps['header']['menu'];
  publicStoreDomain: string;
  primaryDomainUrl: string;
}): NavItem[] {
  if (menu?.items?.length) {
    return menu.items
      .map((item) => {
        if (!item.url) return null;

        const href = toPathname(
          item.url,
          publicStoreDomain,
          primaryDomainUrl,
        );
        const childLinks =
          item.items?.length > 0
            ? item.items
                .filter((child) => Boolean(child.url))
                .map((child) => {
                  const childHref = toPathname(
                    child.url,
                    publicStoreDomain,
                    primaryDomainUrl,
                  );
                  const childImage =
                    child.resource &&
                    'image' in child.resource &&
                    child.resource.image?.url
                      ? child.resource.image.url
                      : imageForHref(childHref);

                  return {
                    label: child.title,
                    href: childHref,
                    image: childImage,
                  };
                })
            : null;

        const parentImage =
          item.resource &&
          'image' in item.resource &&
          item.resource.image?.url
            ? item.resource.image.url
            : childLinks?.[0]?.image ?? imageForHref(href);

        return {
          id: item.id,
          title: item.title,
          href,
          image: parentImage,
          links: childLinks,
        } satisfies NavItem;
      })
      .filter((item): item is NavItem => Boolean(item));
  }

  return HEADER_NAV.map((item) => ({
    id: item.href,
    title: item.title,
    href: item.href,
    image: item.image,
    links: item.links
      ? item.links.map((link) => ({
          label: link.label,
          href: link.href,
          image: imageForHref(link.href),
        }))
      : null,
  }));
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const {pathname} = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);

  const navItems = useMemo(
    () =>
      buildNavItems({
        menu,
        publicStoreDomain,
        primaryDomainUrl: shop.primaryDomain.url,
      }),
    [menu, publicStoreDomain, shop.primaryDomain.url],
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const megaItem = navItems.find(
    (item) => item.id === activeMega && item.links?.length,
  );
  const megaOpen = Boolean(megaItem);
  const isSolid = !isHome || scrolled || hovered || megaOpen;

  const className = [
    'header',
    isHome ? 'header--home' : 'header--solid',
    scrolled ? 'is-scrolled' : '',
    hovered || megaOpen ? 'is-hovered' : '',
    megaOpen ? 'is-mega-open' : '',
    isSolid ? 'is-solid' : 'is-transparent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActiveMega(null);
      }}
    >
      <div className="header__bar">
        <div className="header__brand">
          <NavLink prefetch="intent" to="/" className="header__logo" end>
            {shop.name}
          </NavLink>

          <HeaderMenu
            items={navItems}
            viewport="desktop"
            activeMega={activeMega}
            onMegaEnter={setActiveMega}
          />
        </div>

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>

      {megaItem && megaItem.links ? (
        <div
          className="header-mega"
          role="region"
          aria-label={`${megaItem.title} menü`}
        >
          <div className="header-mega__inner">
            <ul className="header-mega__links">
              {megaItem.links.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    prefetch="intent"
                    className="header-mega__link"
                    onClick={() => setActiveMega(null)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {megaItem.image ? (
              <div className="header-mega__media">
                <NavLink
                  to={megaItem.href}
                  prefetch="intent"
                  className="header-mega__media-link"
                  onClick={() => setActiveMega(null)}
                  aria-label={`${megaItem.title} koleksiyonunu gör`}
                >
                  <img
                    src={megaItem.image}
                    alt={megaItem.title}
                    width={720}
                    height={900}
                    loading="lazy"
                    decoding="async"
                  />
                </NavLink>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function HeaderMenu({
  items,
  viewport,
  activeMega,
  onMegaEnter,
}: {
  items?: NavItem[];
  viewport: Viewport;
  activeMega?: string | null;
  onMegaEnter?: (id: string | null) => void;
}) {
  const className = `header-menu header-menu--${viewport}`;
  const {close} = useAside();
  const navItems =
    items ??
    HEADER_NAV.map((item) => ({
      id: item.href,
      title: item.title,
      href: item.href,
      image: item.image,
      links: item.links
        ? item.links.map((link) => ({
            label: link.label,
            href: link.href,
            image: imageForHref(link.href),
          }))
        : null,
    }));

  return (
    <nav className={className} role="navigation" aria-label="Ana menü">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          className="header-menu__item"
          to="/"
        >
          Anasayfa
        </NavLink>
      )}
      {navItems.map((item) => {
        const hasMega = Boolean(item.links?.length);

        if (viewport === 'desktop' && hasMega) {
          return (
            <div
              key={item.id}
              className={`header-menu__trigger${
                activeMega === item.id ? ' is-active' : ''
              }`}
              onMouseEnter={() => onMegaEnter?.(item.id)}
            >
              <NavLink
                className="header-menu__item"
                prefetch="intent"
                to={item.href}
              >
                {item.title}
              </NavLink>
            </div>
          );
        }

        if (viewport === 'mobile' && item.links?.length) {
          return (
            <div key={item.id} className="header-menu__group">
              <NavLink
                className="header-menu__item header-menu__item--parent"
                onClick={close}
                prefetch="intent"
                to={item.href}
              >
                {item.title}
              </NavLink>
              <div className="header-menu__children">
                {item.links.map((link) => (
                  <NavLink
                    key={link.href}
                    className="header-menu__item header-menu__item--child"
                    onClick={close}
                    prefetch="intent"
                    to={link.href}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
          <NavLink
            className="header-menu__item"
            end
            key={item.id}
            onClick={close}
            onMouseEnter={() => onMegaEnter?.(null)}
            prefetch="intent"
            to={item.href}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header__actions" aria-label="Hesap ve sepet">
      <SearchToggle />
      <HeaderWishlistButton />
      <CartToggle cart={cart} />
      <AccountLink isLoggedIn={isLoggedIn} />
      <HeaderMenuMobileToggle />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="header__icon-btn header__menu-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Menüyü aç"
    >
      <IconMenu />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="header__icon-btn reset"
      onClick={() => open('search')}
      aria-label="Ara"
    >
      <IconSearch />
    </button>
  );
}

function AccountLink({isLoggedIn}: Pick<HeaderProps, 'isLoggedIn'>) {
  return (
    <NavLink
      prefetch="intent"
      to="/account"
      className="header__icon-btn"
      aria-label="Hesap"
    >
      <Suspense fallback={<IconUser />}>
        <Await resolve={isLoggedIn} errorElement={<IconUser />}>
          {(loggedIn) => <IconUser loggedIn={Boolean(loggedIn)} />}
        </Await>
      </Suspense>
    </NavLink>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="header__icon-btn header__cart-btn reset"
      aria-label={`Sepet${count ? `, ${count} ürün` : ''}`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <IconCart />
      {count > 0 ? <span className="header__cart-count">{count}</span> : null}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
