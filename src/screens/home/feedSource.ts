import {
  CURATED_WORLDS,
  LIGHTS,
  PIECES_MAX,
  PIECES_MIN,
  SETTINGS,
  World,
} from './worlds';

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * A stateful, endless source of feed worlds. Serves the curated pool first,
 * then generates `setting × light` scenes forever — all within one aesthetic.
 * Each world gets a unique id, and no scene label repeats back-to-back.
 *
 * Create one per feed (kept in a ref) so its cursor/id/last-label state is
 * self-contained and resets cleanly if the feed remounts.
 */
export function createFeedSource() {
  let curatedCursor = 0;
  let uid = 0;
  let lastLabel = '';

  const generateLabel = (): string => {
    let label = '';
    do {
      label = `${pick(SETTINGS)}, ${pick(LIGHTS)}`;
    } while (label === lastLabel);
    lastLabel = label;
    return label;
  };

  const nextWorld = (): World => {
    uid += 1;
    const id = `feed-${uid}`;
    if (curatedCursor < CURATED_WORLDS.length) {
      const base = CURATED_WORLDS[curatedCursor];
      curatedCursor += 1;
      lastLabel = base.heroLabel; // don't let the generator echo it next
      return { id, ...base };
    }
    return { id, heroLabel: generateLabel(), pieces: randInt(PIECES_MIN, PIECES_MAX) };
  };

  return {
    /** Returns the next `n` worlds in the endless stream. */
    next(n: number): World[] {
      return Array.from({ length: n }, nextWorld);
    },
  };
}
