export type World = {
  id: string;
  /** Placeholder label shown in the hero slot until real imagery exists. */
  heroLabel: string;
  pieces: number;
};

/**
 * The feed is an endless "For You" stream anchored to one aesthetic — warm,
 * natural-light, slow-living interiors. It's served curated-first (the
 * hand-written picks below) then extended forever by the generator (see
 * feedSource.ts), so it reads like a coherent, personalised recommendation
 * feed rather than a repeating list.
 */

/** Hand-written "best" recommendations, shown before the generator kicks in. */
export const CURATED_WORLDS: Omit<World, 'id'>[] = [
  { heroLabel: 'Sunlit reading corner', pieces: 14 },
  { heroLabel: 'Slow coast morning', pieces: 9 },
  { heroLabel: 'Reading nook, dusk', pieces: 11 },
  { heroLabel: 'Sunroom, 3pm', pieces: 16 },
  { heroLabel: 'Linen bedroom, noon', pieces: 6 },
  { heroLabel: 'Quiet kitchen, first light', pieces: 8 },
  { heroLabel: 'Olive terrace, golden hour', pieces: 12 },
  { heroLabel: "Potter's corner, morning", pieces: 10 },
  { heroLabel: 'Ink-blue study, evening', pieces: 21 },
  { heroLabel: 'Garden room, after rain', pieces: 13 },
  { heroLabel: 'Weathered oak hallway', pieces: 7 },
  { heroLabel: 'Wool and clay living room', pieces: 18 },
];

/** Generator settings — all within the one aesthetic, chosen to pair cleanly. */
export const SETTINGS: string[] = [
  'Sunroom',
  'Reading nook',
  'Quiet kitchen',
  'Linen bedroom',
  'Olive terrace',
  "Potter's corner",
  'Garden room',
  'Coastal veranda',
  'Slow study',
  'Morning parlour',
  'Whitewashed porch',
  'Sunlit alcove',
  'Airy loft',
  'Clay-toned lounge',
  'Weathered hallway',
];

/** Time / quality of light — the second half of a generated scene name. */
export const LIGHTS: string[] = [
  '3pm',
  'first light',
  'golden hour',
  'dusk',
  'after rain',
  'noon',
  'early morning',
  'late afternoon',
  'soft evening',
  'overcast',
];

/** Plausible piece-count range for generated worlds. */
export const PIECES_MIN = 5;
export const PIECES_MAX = 24;
