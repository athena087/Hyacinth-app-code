import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BagItem, parsePrice } from '../screens/bag/bagData';

type CartValue = {
  items: BagItem[];
  total: number;
  count: number;
  /** Number of multi-piece "Looks" in the cart. */
  looks: number;
  /** Number of single "Item" pieces in the cart. */
  pieces: number;
  add: (item: BagItem) => void;
  remove: (id: string) => void;
  /** Is this id already in the bag? (drives the add/remove toggle). */
  has: (id: string) => boolean;
};

const STORAGE_KEY = 'hyacinth.cart';

const CartContext = createContext<CartValue | null>(null);

/**
 * Shared cart state so View Item, the bag and checkout read one source of truth.
 * Starts EMPTY; worlds ("looks") and pieces are added from View Item. Persists
 * across restarts via AsyncStorage (device-local); dedupes by id.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const hydrated = useRef(false);

  // Load once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || hydrated.current) return;
        hydrated.current = true;
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          // Corrupt — start empty.
        }
      })
      .catch(() => {
        // Storage unavailable — degrade to an in-memory session.
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: BagItem[]) => {
    hydrated.current = true;
    setItems(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const add = useCallback(
    (item: BagItem) => {
      if (itemsRef.current.some((i) => i.id === item.id)) return;
      persist([item, ...itemsRef.current]);
    },
    [persist],
  );
  const remove = useCallback(
    (id: string) => {
      persist(itemsRef.current.filter((i) => i.id !== id));
    },
    [persist],
  );

  const value = useMemo<CartValue>(
    () => ({
      items,
      total: items.reduce((sum, it) => sum + parsePrice(it.price), 0),
      count: items.length,
      looks: items.filter((it) => it.bundle).length,
      pieces: items.filter((it) => !it.bundle).length,
      add,
      remove,
      has: (id) => items.some((it) => it.id === id),
    }),
    [items, add, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
