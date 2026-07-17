export type BagItem = {
  id: string;
  /** A multi-piece "Look" (horizontal thumbnail strip) vs a single "Item". */
  bundle: boolean;
  /** Overline label, e.g. "Look · 5 pieces" or "Item". */
  kind: string;
  name: string;
  meta: string;
  /** Display price string, e.g. "£2,548". Parsed for the running total. */
  price: string;
  /** Placeholder thumbnails — one per piece (bundle) or a single hero (item). */
  images: string[];
  /** The world this came from — used to reopen it from the bag. */
  world?: string;
  /** Family/palette ids so the world regenerates identically on reopen. */
  family?: string;
  palette?: string;
};

/** Strips currency/formatting to a number, e.g. "£2,548" → 2548. */
export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}

/** Formats a number as GBP with thousands separators, e.g. 2548 → "£2,548". */
export function formatPrice(n: number): string {
  return '£' + n.toLocaleString('en-GB');
}
