// The shared mood taxonomy — the single source of truth for BOTH search
// relevance (resolveQuery) and the refine carousels. Two independent axes:
//   • MoodFamily  → the THEME carousel (Coastal, Warm, …)
//   • MoodPalette → the PALETTE carousel (Sand, Clay, …), which also supplies
//     the hex tints that make a placeholder world read as on-mood without any
//     photography.
// Hero worlds are bespoke results tied to scripted demo queries.

export type MoodPalette = {
  id: string;
  label: string;
  /** Match terms (with synonyms) that route a query to this palette. */
  tags: string[];
  /** Hex shades used to tint result world tiles. */
  colors: string[];
};

export type MoodFamily = {
  id: string;
  label: string;
  /** Match terms (with synonyms) that route a query to this family. */
  tags: string[];
  /** Scene nouns — first half of a generated world name. */
  settings: string[];
  /** Time / quality of light — second half of a generated world name. */
  lights: string[];
  /** Palette leaned on when the query doesn't name one itself. */
  defaultPaletteId: string;
};

export type HeroWorld = {
  /** Normalized phrases; all words present in the query → this hero wins. */
  triggers: string[];
  familyId: string;
  paletteId: string;
  heroLabel: string;
  pieces: number;
};

export const PALETTES: MoodPalette[] = [
  {
    id: 'sand',
    label: 'Sand',
    tags: ['sand', 'sandy', 'beige', 'oat', 'cream', 'linen', 'pale', 'neutral', 'ecru'],
    colors: ['#E7DAC6', '#D8C4A6', '#EFE6D6', '#DCCDB4'],
  },
  {
    id: 'clay',
    label: 'Clay',
    tags: ['clay', 'terracotta', 'rust', 'warm', 'amber', 'earthy', 'ochre-red', 'brick'],
    colors: ['#CB9A82', '#B87F63', '#DDB49E', '#C68A6E'],
  },
  {
    id: 'sage',
    label: 'Sage',
    tags: ['sage', 'green', 'olive', 'garden', 'botanical', 'moss', 'verdant', 'plant'],
    colors: ['#AEB99F', '#C3CDB6', '#95A487', '#B7C1A6'],
  },
  {
    id: 'slate',
    label: 'Slate',
    tags: ['slate', 'grey', 'gray', 'blue', 'ink', 'cool', 'stone', 'steel', 'moody'],
    colors: ['#94A0A9', '#AEB9C0', '#7A868F', '#A2ADB4'],
  },
  {
    id: 'ochre',
    label: 'Ochre',
    tags: ['ochre', 'gold', 'golden', 'honey', 'mustard', 'sun', 'wheat', 'amber'],
    colors: ['#CBA55E', '#D9BC7E', '#B88E3C', '#D2B06B'],
  },
  {
    id: 'olive',
    label: 'Olive',
    tags: ['olive', 'khaki', 'forest', 'herb', 'mediterranean', 'deep-green'],
    colors: ['#8B9A6B', '#9EAD7E', '#79885B', '#93A275'],
  },
  {
    id: 'blush',
    label: 'Blush',
    tags: ['blush', 'pink', 'rose', 'dusty', 'petal', 'mauve', 'soft'],
    colors: ['#E3C4C0', '#D9B0AC', '#EAD2CE', '#DDB9B4'],
  },
  {
    id: 'walnut',
    label: 'Walnut',
    tags: ['walnut', 'wood', 'oak', 'timber', 'brown', 'chestnut', 'wooden'],
    colors: ['#A87E5C', '#B98F6B', '#966E4E', '#B0855F'],
  },
  {
    id: 'sky',
    label: 'Sky',
    tags: ['sky', 'powder', 'azure', 'pale-blue', 'airy', 'breezy'],
    colors: ['#C3D2DA', '#AEC2CD', '#D2DEE4', '#B8CAD3'],
  },
  {
    id: 'pewter',
    label: 'Pewter',
    tags: ['pewter', 'graphite', 'smoke', 'charcoal', 'muted', 'stone-grey'],
    colors: ['#9AA0A2', '#B0B5B7', '#868C8E', '#A4AAAC'],
  },
];

export const FAMILIES: MoodFamily[] = [
  {
    id: 'coastal',
    label: 'Coastal',
    tags: ['coast', 'coastal', 'beach', 'sea', 'ocean', 'shore', 'seaside', 'breezy', 'airy', 'calm', 'sandy', 'light', 'linen'],
    settings: ['Coastal veranda', 'Whitewashed porch', 'Airy loft', 'Sunlit alcove', 'Sea-glass sunroom'],
    lights: ['first light', 'early morning', 'overcast', 'soft evening'],
    defaultPaletteId: 'sand',
  },
  {
    id: 'warm',
    label: 'Warm',
    tags: ['warm', 'cosy', 'cozy', 'snug', 'inviting', 'wool', 'amber', 'honey', 'soft', 'comfort', 'hearth', 'reading', 'nook'],
    settings: ['Wool and clay lounge', 'Linen bedroom', 'Morning parlour', 'Sunroom', 'Clay-toned lounge'],
    lights: ['golden hour', 'late afternoon', '3pm', 'soft evening'],
    defaultPaletteId: 'clay',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    tags: ['minimal', 'simple', 'clean', 'pared', 'spare', 'quiet', 'uncluttered', 'neutral', 'plain', 'modern', 'study', 'ink'],
    settings: ['Sunlit alcove', 'Quiet kitchen', 'Airy loft', 'Linen bedroom', 'Bare study'],
    lights: ['noon', 'first light', 'overcast', 'late afternoon'],
    defaultPaletteId: 'slate',
  },
  {
    id: 'rustic',
    label: 'Rustic',
    tags: ['rustic', 'rural', 'farmhouse', 'weathered', 'earthy', 'oak', 'stone', 'rugged', 'worn', 'country'],
    settings: ['Weathered hallway', 'Stone kitchen', "Potter's corner", 'Barn conversion', 'Reclaimed-oak den'],
    lights: ['after rain', 'golden hour', 'late afternoon', 'dusk'],
    defaultPaletteId: 'walnut',
  },
  {
    id: 'botanical',
    label: 'Botanical',
    tags: ['botanical', 'garden', 'green', 'plants', 'plant', 'verdant', 'greenhouse', 'fresh', 'leafy', 'fern', 'conservatory', 'foliage'],
    settings: ['Garden room', 'Greenhouse corner', 'Fern-filled nook', 'Potting bench', 'Conservatory'],
    lights: ['after rain', 'morning mist', 'golden hour', 'soft evening'],
    defaultPaletteId: 'sage',
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    tags: ['mediterranean', 'med', 'olive', 'terracotta', 'aegean', 'sunbaked', 'citrus', 'lemon', 'whitewash', 'riviera'],
    settings: ['Olive terrace', 'Sun-baked courtyard', 'Whitewashed loggia', 'Lemon-tree patio', 'Aegean kitchen'],
    lights: ['golden hour', 'high noon', 'late afternoon', 'warm dusk'],
    defaultPaletteId: 'olive',
  },
  {
    id: 'japandi',
    label: 'Japandi',
    tags: ['japandi', 'japanese', 'zen', 'tatami', 'wabi', 'serene', 'wood', 'natural', 'calm', 'pared'],
    settings: ['Oak-and-paper study', 'Tatami corner', 'Warm minimal lounge', 'Cedar bathroom', 'Low-table nook'],
    lights: ['first light', 'soft evening', 'overcast', 'late afternoon'],
    defaultPaletteId: 'walnut',
  },
  {
    id: 'moody',
    label: 'Moody',
    tags: ['moody', 'dark', 'evening', 'candlelit', 'dim', 'dramatic', 'shadowy', 'nocturnal', 'velvet', 'intimate'],
    settings: ['Candlelit parlour', 'Ink-blue study', 'Velvet reading room', 'Shadowed library', 'Low-lit lounge'],
    lights: ['soft evening', 'dusk', 'candlelight', 'late night'],
    defaultPaletteId: 'pewter',
  },
];

export const HERO_WORLDS: HeroWorld[] = [
  {
    triggers: ['calm coastal morning', 'coastal morning', 'beach morning', 'calm beach', 'slow coast morning'],
    familyId: 'coastal',
    paletteId: 'sand',
    heroLabel: 'Slow coast morning',
    pieces: 9,
  },
  {
    triggers: ['reading nook', 'reading corner', 'reading nook dusk', 'quiet reading', 'cosy reading nook'],
    familyId: 'warm',
    paletteId: 'clay',
    heroLabel: 'Reading nook, dusk',
    pieces: 11,
  },
  {
    triggers: ['moody study', 'ink study', 'dark study', 'evening study', 'study work'],
    familyId: 'minimal',
    paletteId: 'slate',
    heroLabel: 'Ink-blue study, evening',
    pieces: 21,
  },
  {
    triggers: ['garden room', 'botanical', 'green room', 'plant room', 'garden after rain'],
    familyId: 'botanical',
    paletteId: 'sage',
    heroLabel: 'Garden room, after rain',
    pieces: 13,
  },
  {
    triggers: ['greenhouse', 'conservatory', 'plant-filled room', 'indoor jungle', 'fern room'],
    familyId: 'botanical',
    paletteId: 'sage',
    heroLabel: 'Sunlit conservatory',
    pieces: 15,
  },
  {
    triggers: ['olive terrace', 'mediterranean', 'sun-soaked patio', 'aegean', 'lemon tree', 'sunbaked courtyard'],
    familyId: 'mediterranean',
    paletteId: 'olive',
    heroLabel: 'Olive terrace, golden hour',
    pieces: 12,
  },
  {
    triggers: ['japandi', 'zen retreat', 'tatami room', 'warm minimal wood', 'japanese minimal'],
    familyId: 'japandi',
    paletteId: 'walnut',
    heroLabel: 'Oak and paper study',
    pieces: 10,
  },
  {
    triggers: ['candlelit parlour', 'moody evening', 'dark and cosy', 'velvet lounge', 'low-lit lounge'],
    familyId: 'moody',
    paletteId: 'pewter',
    heroLabel: 'Candlelit parlour, dusk',
    pieces: 8,
  },
  {
    triggers: ['warm sunroom', 'sunlit afternoon', 'sunroom 3pm'],
    familyId: 'warm',
    paletteId: 'ochre',
    heroLabel: 'Sunroom, 3pm',
    pieces: 16,
  },
  {
    triggers: ['linen bedroom', 'coastal bedroom', 'breezy bedroom', 'airy bedroom'],
    familyId: 'coastal',
    paletteId: 'sky',
    heroLabel: 'Linen bedroom, first light',
    pieces: 6,
  },
  {
    triggers: ['quiet kitchen', 'minimal kitchen', 'pared back kitchen', 'bare kitchen'],
    familyId: 'minimal',
    paletteId: 'slate',
    heroLabel: 'Quiet kitchen, first light',
    pieces: 8,
  },
  {
    triggers: ['weathered hallway', 'farmhouse', 'stone kitchen', 'rustic hallway', 'reclaimed oak'],
    familyId: 'rustic',
    paletteId: 'walnut',
    heroLabel: 'Weathered oak hallway',
    pieces: 7,
  },
  // Clothing / wardrobe worlds — same mood + palette axes, apparel subjects.
  {
    triggers: ['linen summer outfit', 'coastal linen dress', 'summer capsule', 'breezy summer look', 'beach outfit'],
    familyId: 'coastal',
    paletteId: 'sand',
    heroLabel: 'Linen summer capsule',
    pieces: 8,
  },
  {
    triggers: ['capsule wardrobe', 'minimalist outfit', 'tailored neutrals', 'pared back wardrobe', 'clean tailoring'],
    familyId: 'minimal',
    paletteId: 'slate',
    heroLabel: 'Tailored capsule wardrobe',
    pieces: 10,
  },
  {
    triggers: ['autumn knitwear', 'cosy knit layers', 'wool jumper', 'chunky knits', 'warm layers'],
    familyId: 'warm',
    paletteId: 'clay',
    heroLabel: 'Autumn knitwear layers',
    pieces: 9,
  },
  {
    triggers: ['monochrome outfit', 'all black look', 'moody eveningwear', 'dark tailoring', 'evening dress'],
    familyId: 'moody',
    paletteId: 'pewter',
    heroLabel: 'Monochrome evening look',
    pieces: 7,
  },
  {
    triggers: ['sun-faded linens', 'mediterranean wardrobe', 'olive utility', 'riviera summer look', 'linen shirt'],
    familyId: 'mediterranean',
    paletteId: 'olive',
    heroLabel: 'Sun-faded linen looks',
    pieces: 8,
  },
  {
    triggers: ['workwear layers', 'rugged workwear', 'canvas and denim', 'earthy workwear', 'utility outfit'],
    familyId: 'rustic',
    paletteId: 'walnut',
    heroLabel: 'Rugged workwear layers',
    pieces: 9,
  },
];

export const familyById = (id: string | undefined): MoodFamily | undefined =>
  FAMILIES.find((f) => f.id === id);

export const paletteById = (id: string | undefined): MoodPalette | undefined =>
  PALETTES.find((p) => p.id === id);

export const DEFAULT_FAMILY_ID = 'warm';

// Relevance — which refinements make sense for a given search. Keyed by the
// query's resolved (primary) family, so the refine carousels only offer nearby
// themes and fitting palettes (a beach search never offers "Botanical").
const FAMILY_RELATED: Record<string, string[]> = {
  coastal: ['minimal', 'mediterranean', 'japandi'],
  warm: ['rustic', 'minimal', 'moody'],
  minimal: ['japandi', 'coastal', 'moody'],
  rustic: ['warm', 'botanical', 'mediterranean'],
  botanical: ['rustic', 'mediterranean', 'coastal'],
  mediterranean: ['coastal', 'rustic', 'botanical'],
  japandi: ['minimal', 'warm', 'coastal'],
  moody: ['warm', 'minimal', 'rustic'],
};

const FAMILY_PALETTES: Record<string, string[]> = {
  coastal: ['sand', 'sky', 'slate'],
  warm: ['clay', 'ochre', 'walnut', 'sand'],
  minimal: ['slate', 'sand', 'pewter'],
  rustic: ['walnut', 'ochre', 'olive'],
  botanical: ['sage', 'olive', 'sand'],
  mediterranean: ['olive', 'ochre', 'sand', 'clay'],
  japandi: ['walnut', 'sand', 'slate'],
  moody: ['pewter', 'slate', 'walnut'],
};

/** Themes worth offering for a search whose primary family is `primaryId`. */
export function relevantThemes(primaryId: string): MoodFamily[] {
  const ids = [primaryId, ...(FAMILY_RELATED[primaryId] ?? [])];
  return ids
    .map((id) => familyById(id))
    .filter((f): f is MoodFamily => Boolean(f));
}

/** Palettes worth offering for a search whose primary family is `primaryId`. */
export function relevantPalettes(primaryId: string): MoodPalette[] {
  const fam = familyById(primaryId);
  const ids = FAMILY_PALETTES[primaryId] ?? (fam ? [fam.defaultPaletteId] : []);
  return ids
    .map((id) => paletteById(id))
    .filter((p): p is MoodPalette => Boolean(p));
}
