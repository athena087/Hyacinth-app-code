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
};

/** Hardcoded bag contents — no cart backend yet. */
export const BAG_ITEMS: BagItem[] = [
  {
    id: 'bag-look',
    bundle: true,
    kind: 'Look · 5 pieces',
    name: 'Sunlit Reading Corner',
    meta: 'Linen sofa, lamp, rug, table, vase',
    price: '£2,548',
    images: ['sofa', 'lamp', 'rug', 'table', 'vase'],
  },
  {
    id: 'bag-sofa',
    bundle: false,
    kind: 'Item',
    name: 'Linen Sofa',
    meta: 'Oat · Belgian slub linen',
    price: '£1,240',
    images: ['sofa'],
  },
  {
    id: 'bag-coastal',
    bundle: true,
    kind: 'Look · 3 pieces',
    name: 'Coastal Calm',
    meta: 'Chair, side table, throw',
    price: '£980',
    images: ['chair', 'table', 'throw'],
  },
  {
    id: 'bag-vase',
    bundle: false,
    kind: 'Item',
    name: 'Ceramic Vase',
    meta: 'Chalk · matte stoneware',
    price: '£68',
    images: ['vase'],
  },
];

/** Strips currency/formatting to a number, e.g. "£2,548" → 2548. */
export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}

/** Formats a number as GBP with thousands separators, e.g. 2548 → "£2,548". */
export function formatPrice(n: number): string {
  return '£' + n.toLocaleString('en-GB');
}
