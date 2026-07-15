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
    id: 'nordic',
    label: 'Nordic',
    tags: ['nordic', 'scandi', 'scandinavian', 'cool', 'crisp', 'pale', 'hygge', 'birch', 'frost', 'muted'],
    settings: ['Birch-lined nook', 'Quiet kitchen', 'Airy loft', 'Morning parlour', 'Pale study'],
    lights: ['overcast', 'first light', 'soft evening', 'early morning'],
    defaultPaletteId: 'slate',
  },
  {
    id: 'rustic',
    label: 'Rustic',
    tags: ['rustic', 'rural', 'farmhouse', 'weathered', 'earthy', 'oak', 'stone', 'rugged', 'worn', 'country', 'garden'],
    settings: ['Weathered hallway', 'Garden room', "Potter's corner", 'Olive terrace', 'Stone kitchen'],
    lights: ['after rain', 'golden hour', 'late afternoon', 'dusk'],
    defaultPaletteId: 'ochre',
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
    familyId: 'rustic',
    paletteId: 'sage',
    heroLabel: 'Garden room, after rain',
    pieces: 13,
  },
];

export const familyById = (id: string | undefined): MoodFamily | undefined =>
  FAMILIES.find((f) => f.id === id);

export const paletteById = (id: string | undefined): MoodPalette | undefined =>
  PALETTES.find((p) => p.id === id);

export const DEFAULT_FAMILY_ID = 'warm';
