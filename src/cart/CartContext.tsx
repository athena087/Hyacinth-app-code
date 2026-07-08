import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { BAG_ITEMS, BagItem, parsePrice } from '../screens/bag/bagData';

type CartValue = {
  items: BagItem[];
  total: number;
  count: number;
  /** Number of multi-piece "Looks" in the cart. */
  looks: number;
  /** Number of single "Item" pieces in the cart. */
  pieces: number;
  remove: (id: string) => void;
};

const CartContext = createContext<CartValue | null>(null);

/**
 * Shared cart state so the bag and checkout read one source of truth. Seeded
 * from BAG_ITEMS; removals are tracked by id rather than mutating the source.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [removed, setRemoved] = useState<Record<string, boolean>>({});

  const value = useMemo<CartValue>(() => {
    const items = BAG_ITEMS.filter((it) => !removed[it.id]);
    return {
      items,
      total: items.reduce((sum, it) => sum + parsePrice(it.price), 0),
      count: items.length,
      looks: items.filter((it) => it.bundle).length,
      pieces: items.filter((it) => !it.bundle).length,
      remove: (id) => setRemoved((r) => ({ ...r, [id]: true })),
    };
  }, [removed]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
