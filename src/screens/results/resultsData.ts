export type ResultTile = { label: string; height: number };

/** Masonry tiles, per the design. Two columns; the right is staggered down. */
export const LEFT_COLUMN: ResultTile[] = [
  { label: 'Sunroom, 3pm', height: 196 },
  { label: 'Reading nook', height: 250 },
  { label: 'Quiet kitchen', height: 214 },
  { label: 'Linen bedroom', height: 240 },
];

export const RIGHT_COLUMN: ResultTile[] = [
  { label: 'Slow morning', height: 298 },
  { label: 'Warm study', height: 232 },
  { label: 'Dusk parlour', height: 262 },
  { label: 'Soft light', height: 300 },
];

/** Filter chips shown under the search bar. */
export const RESULT_CHIPS = ['Coastal', 'Minimal', 'Warm'];
