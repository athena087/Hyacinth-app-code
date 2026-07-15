// The single relevance boundary. Both Results and Refine call this, so they
// share one taxonomy. Deterministic + offline today; later, Claude Haiku can be
// added as a first step INSIDE this function (free text → tags → same family/
// palette machinery) with no change to any screen that consumes it.
//
// The typed query is a SOFT signal (best-guess match); refine facets are HARD
// constraints (explicit overrides). Same resolver, two entry points.

import {
  DEFAULT_FAMILY_ID,
  FAMILIES,
  familyById,
  HERO_WORLDS,
  HeroWorld,
  MoodFamily,
  MoodPalette,
  PALETTES,
  paletteById,
} from './moodLibrary';

export type Refinements = { theme?: string; palette?: string };

export type Interpretation = {
  query: string;
  family: MoodFamily;
  palette: MoodPalette;
  heroWorld?: HeroWorld;
  /** Short mood tags echoed back in the search chrome (≤3). */
  chips: string[];
};

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'my', 'me', 'some', 'that', 'this', 'feel', 'feels', 'feeling', 'like', 'want',
]);

function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Count how many of `tags` appear among the query tokens. */
function scoreTags(tokens: Set<string>, tags: string[]): number {
  let score = 0;
  for (const t of tags) if (tokens.has(t)) score += 1;
  return score;
}

/** A hero wins when every word of one of its triggers is present in the query. */
function matchHero(tokens: Set<string>): HeroWorld | undefined {
  return HERO_WORLDS.find((h) =>
    h.triggers.some((trigger) => {
      const words = trigger.split(' ').filter(Boolean);
      return words.every((w) => tokens.has(w));
    }),
  );
}

/** Highest-scoring item by tag hits, or undefined if nothing matched. */
function bestByTags<T extends { tags: string[] }>(
  tokens: Set<string>,
  items: T[],
): T | undefined {
  let best: T | undefined;
  let bestScore = 0;
  for (const item of items) {
    const s = scoreTags(tokens, item.tags);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }
  return best;
}

export function resolveQuery(rawText: string, refinements: Refinements = {}): Interpretation {
  const list = tokenize(rawText);
  const tokens = new Set(list);
  // Locking a THEME in refine is the user taking manual control of the category,
  // so a text-derived bespoke hero (possibly off-theme) is suppressed.
  const hero = refinements.theme ? undefined : matchHero(tokens);

  // Family: explicit refine override → hero's family → best text match → default.
  const family =
    familyById(refinements.theme) ??
    familyById(hero?.familyId) ??
    bestByTags(tokens, FAMILIES) ??
    familyById(DEFAULT_FAMILY_ID)!;

  // Palette: explicit refine override → hero's palette → best text match →
  // the family's default palette.
  const palette =
    paletteById(refinements.palette) ??
    paletteById(hero?.paletteId) ??
    bestByTags(tokens, PALETTES) ??
    paletteById(family.defaultPaletteId)!;

  // Chips: family + palette, plus one distinctive matched family tag if room.
  const chips: string[] = [family.label, palette.label];
  const extra = family.tags.find(
    (t) => tokens.has(t) && t !== family.label.toLowerCase() && t !== palette.label.toLowerCase(),
  );
  if (extra) chips.push(extra.charAt(0).toUpperCase() + extra.slice(1));

  return { query: rawText, family, palette, heroWorld: hero, chips: chips.slice(0, 3) };
}
