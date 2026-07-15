// Endless results feed — the same staggered two-column masonry as Explore,
// occasionally broken by a full-width "hero world". Within each generated
// section the two columns are built to the SAME total height (and same tile
// count, so the gaps match), so worlds vary in length yet both columns end
// flush — letting a hero span the full width with the two worlds above it
// ending, and the two below starting, level.
//
// The world dimensions match the original Results page (heights in [MIN, MAX]),
// so worlds keep the same size band as before — the page just keeps going now.

export type ResultFeedTile = { id: string; label: string; height: number };

export type ResultSection = {
  id: string;
  left: ResultFeedTile[];
  right: ResultFeedTile[];
  /** On occasion, a full-width world spanning both columns below the masonry. */
  hero?: ResultFeedTile;
};

const LABELS = [
  'Sunroom, 3pm',
  'Reading nook',
  'Quiet kitchen',
  'Linen bedroom',
  'Slow morning',
  'Warm study',
  'Dusk parlour',
  'Soft light',
  'Coastal veranda',
  'Olive terrace',
  "Potter's corner",
  'Garden room',
  'Morning parlour',
  'Weathered hallway',
  'Sunlit alcove',
  'Airy loft',
];

// Keep the world dimensions in the same band as the original Results tiles.
const MIN = 250; // shortest a world can be
const MAX = 350; // tallest a world can be
const HERO_MIN = 280; // shortest a hero world can be
const HERO_MAX = 500; // tallest a hero world can be
const HERO_CHANCE = 0.5; // how often a section is capped with a hero world

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Returns `k` heights in [MIN, MAX] that sum exactly to `target`. The per-slot
 * bounds keep every draw feasible, so it succeeds on the first pass; the even
 * split is just a defensive fallback.
 */
function heightsSummingTo(target: number, k: number): number[] {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const parts: number[] = [];
    let remaining = target;
    let ok = true;
    for (let i = 0; i < k - 1; i += 1) {
      const slotsLeft = k - 1 - i;
      const hi = Math.min(MAX, remaining - MIN * slotsLeft);
      const lo = Math.max(MIN, remaining - MAX * slotsLeft);
      if (hi < lo) {
        ok = false;
        break;
      }
      const h = randInt(lo, hi);
      parts.push(h);
      remaining -= h;
    }
    if (ok && remaining >= MIN && remaining <= MAX) {
      parts.push(remaining);
      return parts;
    }
  }
  const base = Math.floor(target / k);
  const parts = Array<number>(k).fill(base);
  parts[k - 1] += target - base * k;
  return parts;
}

/**
 * Stateful, endless source of result sections. Keep one per feed (in a ref) so
 * its id counters are self-contained and reset cleanly on remount.
 */
export function createResultsFeed() {
  let tid = 0;
  let sid = 0;
  let sectionIdx = 0;

  const tile = (height: number): ResultFeedTile => {
    tid += 1;
    return { id: `res-${tid}`, label: pick(LABELS), height };
  };

  const makeSection = (): ResultSection => {
    const k = randInt(2, 4); // tiles per column (same count → matching gaps)
    const leftHeights = Array.from({ length: k }, () => randInt(MIN, MAX));
    const total = leftHeights.reduce((a, b) => a + b, 0);
    const rightHeights = heightsSummingTo(total, k);

    sid += 1;
    const section: ResultSection = {
      id: `sec-${sid}`,
      left: leftHeights.map((h) => tile(h)),
      right: rightHeights.map((h) => tile(h)),
    };
    // Not the very first section, then only on occasion.
    if (sectionIdx > 0 && Math.random() < HERO_CHANCE) {
      section.hero = tile(randInt(HERO_MIN, HERO_MAX));
    }
    sectionIdx += 1;
    return section;
  };

  return {
    /** Returns the next `n` sections in the endless stream. */
    next(n: number): ResultSection[] {
      return Array.from({ length: n }, makeSection);
    },
  };
}
