// Per-world items for the View Item screen. Every world composes its OWN set of
// pieces: the mood family decides the materials + colourways, the palette tints
// the collage, and a seed derived from the world's name makes each world's
// selection distinct yet stable (the same world always rebuilds the same items).
//
// Materials are tagged with a `kind`, and each category only accepts the kinds
// it's plausibly made of — so a sofa draws upholstery, a vase draws ceramic/
// glass/stone, and you never get an "Ink Ceramic Sofa".
import { paletteById } from '../search/moodLibrary';

export { parsePrice, formatPrice } from '../bag/bagData';
import { formatPrice } from '../bag/bagData';

export type ItemColour = { n: string; sw: string };

export type ItemStyle = {
  name: string;
  tag: string;
  material: string;
  size: string;
  price: string;
  /** Numeric price for filtering (£). */
  priceValue: number;
  /** Object: largest dimension in cm (for the size-cap filter). */
  maxDim?: number;
  /** Apparel: size labels this piece is available in. */
  sizes?: string[];
  /** Placeholder image id. */
  img: string;
  colours: ItemColour[];
};

export type Item = {
  label: string;
  styles: ItemStyle[];
};

/** A world is composed from one domain — its Refine controls differ by domain. */
export type ItemDomain = 'apparel' | 'object';

/** What a material is made of — used to match materials to categories. */
type Kind = 'soft' | 'wood' | 'metal' | 'ceramic' | 'stone' | 'glass' | 'weave';

// ── Category archetypes: the slots a world can be composed from. ──────────────
type Category = {
  label: string;
  tag: string;
  sizes: string[];
  base: number; // £ starting point
  vary: number; // £ random spread
  kinds: Kind[]; // material kinds this category can be made of
};

const CATEGORIES: Category[] = [
  { label: 'Sofa', tag: 'Two-seater', sizes: ['W 168 · D 88 cm', 'W 172 · D 90 cm', 'W 164 · D 86 cm'], base: 1200, vary: 600, kinds: ['soft'] },
  { label: 'Chair', tag: 'Lounge chair', sizes: ['W 68 · D 74 cm', 'W 72 · D 78 cm'], base: 460, vary: 340, kinds: ['soft', 'wood', 'weave'] },
  { label: 'Lamp', tag: 'Floor light', sizes: ['H 168 cm', 'H 152 cm', 'H 44 cm'], base: 160, vary: 240, kinds: ['metal', 'ceramic', 'glass', 'wood'] },
  { label: 'Rug', tag: 'Hand-loomed', sizes: ['200 × 300 cm', '190 × 290 cm', '170 × 240 cm'], base: 360, vary: 420, kinds: ['weave', 'soft'] },
  { label: 'Table', tag: 'Side table', sizes: ['Ø 45 · H 52 cm', 'Ø 40 · H 50 cm', 'Ø 46 · H 54 cm'], base: 210, vary: 260, kinds: ['wood', 'stone', 'metal', 'ceramic'] },
  { label: 'Vase', tag: 'Tall vessel', sizes: ['H 34 cm', 'H 28 cm', 'H 22 cm'], base: 54, vary: 70, kinds: ['ceramic', 'glass', 'stone'] },
  { label: 'Shelf', tag: 'Wall unit', sizes: ['W 90 · H 30 cm', 'W 120 · H 26 cm'], base: 240, vary: 260, kinds: ['wood', 'metal'] },
];

// ── Per-family flavour: material names (tagged by kind) + colourways. ─────────
// Each family carries a balanced spread — 2 soft, 2 wood, 1 metal, 1 ceramic,
// 1 glass/stone, 1 weave — so every category finds at least two matching kinds.
type Material = { adj: string; full: string; kind: Kind };
type FamilyStyle = { materials: Material[]; swatches: ItemColour[] };

const FAMILY_STYLE: Record<string, FamilyStyle> = {
  coastal: {
    materials: [
      { adj: 'Linen', full: 'Belgian slub linen', kind: 'soft' },
      { adj: 'Washed Cotton', full: 'Stonewashed cotton', kind: 'soft' },
      { adj: 'Bleached Oak', full: 'Pale bleached oak', kind: 'wood' },
      { adj: 'Driftwood', full: 'Weathered driftwood', kind: 'wood' },
      { adj: 'Brushed Nickel', full: 'Brushed nickel', kind: 'metal' },
      { adj: 'Glazed Stoneware', full: 'Sea-glazed stoneware', kind: 'ceramic' },
      { adj: 'Sea Glass', full: 'Recycled sea glass', kind: 'glass' },
      { adj: 'Rattan', full: 'Hand-woven rattan', kind: 'weave' },
    ],
    swatches: [{ n: 'Oat', sw: '#D9C4A8' }, { n: 'Sand', sw: '#E7DAC6' }, { n: 'Sea-glass', sw: '#AEC2CD' }, { n: 'Driftwood', sw: '#B9AE9C' }],
  },
  warm: {
    materials: [
      { adj: 'Bouclé', full: 'Wool bouclé', kind: 'soft' },
      { adj: 'Tan Leather', full: 'Aniline tan leather', kind: 'soft' },
      { adj: 'Walnut', full: 'Oiled walnut', kind: 'wood' },
      { adj: 'Oak', full: 'Warm oiled oak', kind: 'wood' },
      { adj: 'Aged Brass', full: 'Aged brass', kind: 'metal' },
      { adj: 'Terracotta', full: 'Glazed terracotta', kind: 'ceramic' },
      { adj: 'Amber Glass', full: 'Hand-blown amber glass', kind: 'glass' },
      { adj: 'Wool', full: 'Chunky felted wool', kind: 'weave' },
    ],
    swatches: [{ n: 'Clay', sw: '#C08B6B' }, { n: 'Amber', sw: '#CBA55E' }, { n: 'Oat', sw: '#D9C4A8' }, { n: 'Rust', sw: '#B4632F' }],
  },
  minimal: {
    materials: [
      { adj: 'Linen', full: 'Washed linen', kind: 'soft' },
      { adj: 'Canvas', full: 'Cotton canvas', kind: 'soft' },
      { adj: 'Oak', full: 'Solid white oak', kind: 'wood' },
      { adj: 'Ash', full: 'Bleached ash', kind: 'wood' },
      { adj: 'Matte Steel', full: 'Powder-coated steel', kind: 'metal' },
      { adj: 'Stoneware', full: 'Matte stoneware', kind: 'ceramic' },
      { adj: 'Frosted Glass', full: 'Frosted glass', kind: 'glass' },
      { adj: 'Paper Cord', full: 'Woven paper cord', kind: 'weave' },
    ],
    swatches: [{ n: 'Chalk', sw: '#ECE7DE' }, { n: 'Slate', sw: '#94A0A9' }, { n: 'Stone', sw: '#B9AE9C' }, { n: 'Fog', sw: '#B9BDBA' }],
  },
  rustic: {
    materials: [
      { adj: 'Flax Linen', full: 'Natural flax linen', kind: 'soft' },
      { adj: 'Canvas', full: 'Heavy cotton canvas', kind: 'soft' },
      { adj: 'Reclaimed Oak', full: 'Reclaimed oak', kind: 'wood' },
      { adj: 'Knotted Pine', full: 'Knotted pine', kind: 'wood' },
      { adj: 'Cast Iron', full: 'Blackened cast iron', kind: 'metal' },
      { adj: 'Stoneware', full: 'Rough-thrown stoneware', kind: 'ceramic' },
      { adj: 'Slate', full: 'Honed slate', kind: 'stone' },
      { adj: 'Jute', full: 'Natural jute', kind: 'weave' },
    ],
    swatches: [{ n: 'Walnut', sw: '#6E4A2E' }, { n: 'Ochre', sw: '#C79A4A' }, { n: 'Stone', sw: '#B9AE9C' }, { n: 'Ecru', sw: '#EAD9BE' }],
  },
  botanical: {
    materials: [
      { adj: 'Moss Wool', full: 'Moss-dyed wool', kind: 'soft' },
      { adj: 'Linen', full: 'Botanical linen', kind: 'soft' },
      { adj: 'Pale Oak', full: 'Pale oak', kind: 'wood' },
      { adj: 'Bamboo', full: 'Smoked bamboo', kind: 'wood' },
      { adj: 'Verdigris Brass', full: 'Verdigris brass', kind: 'metal' },
      { adj: 'Glazed Clay', full: 'Sea-green glazed clay', kind: 'ceramic' },
      { adj: 'Green Glass', full: 'Recycled green glass', kind: 'glass' },
      { adj: 'Rattan', full: 'Woven rattan', kind: 'weave' },
    ],
    swatches: [{ n: 'Sage', sw: '#9FB0A0' }, { n: 'Olive', sw: '#8B9A6B' }, { n: 'Moss', sw: '#79885B' }, { n: 'Ecru', sw: '#EAD9BE' }],
  },
  mediterranean: {
    materials: [
      { adj: 'Linen', full: 'Heavy washed linen', kind: 'soft' },
      { adj: 'Cotton', full: 'Sun-bleached cotton', kind: 'soft' },
      { adj: 'Olive Wood', full: 'Solid olive wood', kind: 'wood' },
      { adj: 'Whitewashed Oak', full: 'Whitewashed oak', kind: 'wood' },
      { adj: 'Wrought Iron', full: 'Wrought iron', kind: 'metal' },
      { adj: 'Terracotta', full: 'Sun-baked terracotta', kind: 'ceramic' },
      { adj: 'Travertine', full: 'Honed travertine', kind: 'stone' },
      { adj: 'Seagrass', full: 'Woven seagrass', kind: 'weave' },
    ],
    swatches: [{ n: 'Olive', sw: '#8B9A6B' }, { n: 'Ochre', sw: '#CBA55E' }, { n: 'Chalk', sw: '#ECE7DE' }, { n: 'Clay', sw: '#C08B6B' }],
  },
  japandi: {
    materials: [
      { adj: 'Linen', full: 'Natural linen', kind: 'soft' },
      { adj: 'Wool', full: 'Felted wool', kind: 'soft' },
      { adj: 'Ash', full: 'Pale ash', kind: 'wood' },
      { adj: 'Smoked Oak', full: 'Smoked oak', kind: 'wood' },
      { adj: 'Blackened Steel', full: 'Blackened steel', kind: 'metal' },
      { adj: 'Charcoal Ceramic', full: 'Charcoal-glazed ceramic', kind: 'ceramic' },
      { adj: 'Smoked Glass', full: 'Smoked glass', kind: 'glass' },
      { adj: 'Cane', full: 'Woven cane', kind: 'weave' },
    ],
    swatches: [{ n: 'Oat', sw: '#D9C4A8' }, { n: 'Walnut', sw: '#6E4A2E' }, { n: 'Slate', sw: '#94A0A9' }, { n: 'Chalk', sw: '#ECE7DE' }],
  },
  moody: {
    materials: [
      { adj: 'Velvet', full: 'Cotton velvet', kind: 'soft' },
      { adj: 'Oxblood Leather', full: 'Oxblood leather', kind: 'soft' },
      { adj: 'Smoked Oak', full: 'Smoked oak', kind: 'wood' },
      { adj: 'Ebonised Oak', full: 'Ebonised oak', kind: 'wood' },
      { adj: 'Antiqued Brass', full: 'Antiqued brass', kind: 'metal' },
      { adj: 'Ink Ceramic', full: 'Ink-glazed ceramic', kind: 'ceramic' },
      { adj: 'Smoked Glass', full: 'Smoked glass', kind: 'glass' },
      { adj: 'Charcoal Wool', full: 'Charcoal wool weave', kind: 'weave' },
    ],
    swatches: [{ n: 'Pewter', sw: '#9AA0A2' }, { n: 'Ink', sw: '#6F7C86' }, { n: 'Brass', sw: '#C6A15B' }, { n: 'Charcoal', sw: '#4A342A' }],
  },
};

const DEFAULT_STYLE = FAMILY_STYLE.warm;
const DEFAULT_PALETTE = ['#EFE6D6', '#D9C4A8', '#C08B6B', '#9FB0A0', '#6E4A2E', '#3B3A36'];

// ── Apparel domain: garment categories + fabrics (materials are all soft). ────
const APPAREL_CATEGORIES: Category[] = [
  { label: 'Jacket', tag: 'Outerwear', sizes: ['66 cm length', '68 cm length'], base: 180, vary: 240, kinds: ['soft'] },
  { label: 'Knit', tag: 'Knitwear', sizes: ['64 cm length', '66 cm length'], base: 90, vary: 130, kinds: ['soft'] },
  { label: 'Shirt', tag: 'Shirt', sizes: ['74 cm length', '76 cm length'], base: 70, vary: 110, kinds: ['soft'] },
  { label: 'Trousers', tag: 'Trousers', sizes: ['30 in leg', '32 in leg', '34 in leg'], base: 95, vary: 150, kinds: ['soft'] },
  { label: 'Dress', tag: 'Dress', sizes: ['110 cm length', '116 cm length'], base: 130, vary: 220, kinds: ['soft'] },
];

const APPAREL_MATERIALS: Material[] = [
  { adj: 'Linen', full: 'Washed linen', kind: 'soft' },
  { adj: 'Cotton', full: 'Organic cotton', kind: 'soft' },
  { adj: 'Wool', full: 'Merino wool', kind: 'soft' },
  { adj: 'Denim', full: 'Japanese denim', kind: 'soft' },
  { adj: 'Cashmere', full: 'Cashmere', kind: 'soft' },
  { adj: 'Corduroy', full: 'Cotton corduroy', kind: 'soft' },
];

// Object pieces' largest dimension range (cm), keyed by category.
const OBJECT_SPAN: Record<string, [number, number]> = {
  Sofa: [160, 182], Chair: [70, 82], Lamp: [150, 176], Rug: [240, 300],
  Table: [40, 56], Vase: [22, 36], Shelf: [90, 132],
};

// ── Measurable Refine parameters (bands = numeric ranges). ────────────────────
export const SIZE_RUN = [
  { label: 'XS', chest: 86 }, { label: 'S', chest: 92 }, { label: 'M', chest: 98 },
  { label: 'L', chest: 104 }, { label: 'XL', chest: 110 }, { label: 'XXL', chest: 116 },
];

export type PriceBand = { label: string; min: number; max: number };
export const PRICE_BANDS: Record<ItemDomain, PriceBand[]> = {
  apparel: [
    { label: 'Under £80', min: 0, max: 80 },
    { label: '£80–150', min: 80, max: 150 },
    { label: '£150–300', min: 150, max: 300 },
    { label: '£300+', min: 300, max: Infinity },
  ],
  object: [
    { label: 'Under £250', min: 0, max: 250 },
    { label: '£250–600', min: 250, max: 600 },
    { label: '£600–1200', min: 600, max: 1200 },
    { label: '£1200+', min: 1200, max: Infinity },
  ],
};

export type SizeCap = { label: string; max: number };
export const SIZE_CAPS: SizeCap[] = [
  { label: 'Compact · ≤60 cm', max: 60 },
  { label: 'Standard · ≤120 cm', max: 120 },
  { label: 'Large · ≤200 cm', max: 200 },
  { label: 'Any size', max: Infinity },
];

const APPAREL_WORDS = [
  'outfit', 'wardrobe', 'capsule', 'knit', 'knitwear', 'look', 'looks', 'layers',
  'dress', 'shirt', 'tailored', 'eveningwear', 'workwear', 'wear', 'denim', 'linens',
];

/** A rough domain signal for the demo: apparel worlds are named like clothing. */
export function isApparelWorld(name: string): ItemDomain {
  const t = (name || '').toLowerCase();
  return APPAREL_WORDS.some((w) => t.includes(w)) ? 'apparel' : 'object';
}

// ── Deterministic seeded RNG (stable items per world). ───────────────────────
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pickFrom = <T>(arr: T[], rand: () => number): T => arr[Math.floor(rand() * arr.length)];
const randIntR = (rand: () => number, min: number, max: number): number =>
  min + Math.floor(rand() * (max - min + 1));

// A garment's available sizes — a seeded 3–6 of the run, kept in run order.
function pickSizes(rand: () => number): string[] {
  const labels = SIZE_RUN.map((s) => s.label);
  const chosen = new Set(shuffled(labels, rand).slice(0, randIntR(rand, 3, 6)));
  return labels.filter((l) => chosen.has(l));
}

const CATEGORIES_PER_WORLD = 5;
const STYLES_PER_CATEGORY = 3;

/**
 * Compose a world's items from its mood family + palette. `seed` (the world's
 * name) makes the selection distinct-but-stable across worlds; `domain` chooses
 * apparel vs object categories and the measurable fields each carries.
 */
export function buildWorldItems(
  familyId: string,
  paletteId: string,
  seed: string,
  domain: ItemDomain = 'object',
): { items: Item[]; palette: string[] } {
  const fam = FAMILY_STYLE[familyId] ?? DEFAULT_STYLE;
  const rand = mulberry32(hashSeed(seed || familyId));
  const apparel = domain === 'apparel';

  const catalog = apparel ? APPAREL_CATEGORIES : CATEGORIES;
  const cats = shuffled(catalog, rand).slice(0, CATEGORIES_PER_WORLD);

  const items: Item[] = cats.map((cat) => {
    // Apparel draws fabrics; objects draw kind-matched family materials.
    const suited = apparel
      ? APPAREL_MATERIALS
      : fam.materials.filter((m) => cat.kinds.includes(m.kind));
    const pool = suited.length >= 2 ? suited : fam.materials;
    const mats = shuffled(pool, rand).slice(0, STYLES_PER_CATEGORY);

    const styles: ItemStyle[] = mats.map((mat) => {
      const priceValue = cat.base + Math.round((rand() * cat.vary) / 10) * 10;
      const colourCount = 2 + Math.floor(rand() * 2); // 2 or 3
      const style: ItemStyle = {
        name: `${mat.adj} ${cat.label}`,
        tag: cat.tag,
        material: mat.full,
        size: pickFrom(cat.sizes, rand),
        price: formatPrice(priceValue),
        priceValue,
        img: `${cat.label}-${mat.adj}`.toLowerCase().replace(/\s+/g, '-'),
        colours: shuffled(fam.swatches, rand).slice(0, colourCount),
      };
      if (apparel) style.sizes = pickSizes(rand);
      else {
        const span = OBJECT_SPAN[cat.label] ?? [40, 120];
        style.maxDim = randIntR(rand, span[0], span[1]);
      }
      return style;
    });
    return { label: cat.label, styles };
  });

  const palette = paletteById(paletteId)?.colors ?? DEFAULT_PALETTE;
  return { items, palette };
}

// ── Measurable filtering ─────────────────────────────────────────────────────
export type RefineConstraints = {
  /** Apparel: selected size labels. */
  sizes: string[];
  priceBand: PriceBand | null;
  /** Object: max-dimension cap. */
  sizeCap: SizeCap | null;
  /** Optional free-text nudge (does not hard-filter). */
  note: string;
};

export const EMPTY_CONSTRAINTS: RefineConstraints = {
  sizes: [],
  priceBand: null,
  sizeCap: null,
  note: '',
};

export const hasConstraints = (cx: RefineConstraints): boolean =>
  cx.sizes.length > 0 || cx.priceBand !== null || cx.sizeCap !== null || cx.note.trim().length > 0;

function styleMatches(s: ItemStyle, cx: RefineConstraints, domain: ItemDomain): boolean {
  if (cx.priceBand && !(s.priceValue >= cx.priceBand.min && s.priceValue < cx.priceBand.max)) {
    return false;
  }
  if (domain === 'apparel') {
    if (cx.sizes.length && !(s.sizes ?? []).some((x) => cx.sizes.includes(x))) return false;
  } else if (cx.sizeCap && (s.maxDim ?? 0) > cx.sizeCap.max) {
    return false;
  }
  return true;
}

/** A piece qualifies if any of its styles meets the constraints. */
export const pieceMatches = (item: Item, cx: RefineConstraints, domain: ItemDomain): boolean =>
  item.styles.some((s) => styleMatches(s, cx, domain));

export const matchingItems = (items: Item[], cx: RefineConstraints, domain: ItemDomain): Item[] =>
  items.filter((it) => pieceMatches(it, cx, domain));
