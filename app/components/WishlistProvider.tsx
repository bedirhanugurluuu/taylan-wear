import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  readWishlist,
  toWishlistItem,
  writeWishlist,
  type WishlistItem,
  type WishlistProductInput,
} from '~/lib/wishlist';

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (product: WishlistProductInput) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({children}: {children: ReactNode}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readWishlist());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeWishlist(items);
  }, [items, ready]);

  const has = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  );

  const toggle = useCallback((product: WishlistProductInput) => {
    setItems((current) => {
      const exists = current.some((item) => item.productId === product.id);
      if (exists) {
        return current.filter((item) => item.productId !== product.id);
      }
      return [toWishlistItem(product), ...current];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        ready,
        has,
        toggle,
        remove,
        clear,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return value;
}
