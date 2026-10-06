export type WishlistItem = {
  productId: string;
  handle: string;
  title: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  priceAmount?: string | null;
  priceCurrencyCode?: string | null;
};

export type WishlistProductInput = {
  id: string;
  handle: string;
  title: string;
  image?: {
    url?: string | null;
    altText?: string | null;
  } | null;
  price?: {
    amount?: string | null;
    currencyCode?: string | null;
  } | null;
};

const STORAGE_KEY = 'taylanwear.wishlist.v1';

export function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function toWishlistItem(product: WishlistProductInput): WishlistItem {
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    imageUrl: product.image?.url ?? null,
    imageAlt: product.image?.altText ?? product.title,
    priceAmount: product.price?.amount ?? null,
    priceCurrencyCode: product.price?.currencyCode ?? null,
  };
}
