# Search relevance & refinement — design

**Date:** 2026-07-15
**Status:** approved, implementing
**Goal (one line):** both the results feed *and* the refinement options fit the search — a typed mood returns on-mood worlds, and the refine carousels narrow those results along the same axes.

## Context

Pre-YC demo (see `context/hyacinth-preyc-build copy.md`). No real photography yet — results are placeholder tiles. Guided test sessions with steered queries, so relevance must be convincing on chosen queries and *graceful* (never empty/broken) on off-script ones. The differentiator is the interaction model: a result is a composed **world**, and **mood-as-query** is the front door.

Relevance without images is carried by a world's **metadata + colour** (title, palette), not pixels. That is the whole lever.

## Approach (option C)

One resolver behind search — `resolveQuery(text, refinements?)` — deterministic and offline now, with Claude Haiku swappable in later *inside* the same function (no UI change). Results and Refine both call it, so they share one taxonomy and stay in lockstep.

### Coverage model: hero queries + family fallback

- A few **hero worlds** tied to scripted demo queries → bespoke standout results.
- Everything else resolves to the nearest **mood family** (+ palette); if nothing matches, a default family so results are never empty.

## Data — one shared mood library (`src/screens/search/moodLibrary.ts`)

Two independent axes, mirroring the refine carousels exactly:

```
MoodFamily  = { id, label, tags[], settings[], lights[], defaultPaletteId }   // THEME
MoodPalette = { id, label, tags[], colors[] }                                 // PALETTE (hex tints)
HeroWorld   = { triggers[], familyId, paletteId, heroLabel, pieces }
```

- **Families** (THEME_OPTIONS): Coastal, Warm, Minimal, Nordic, Rustic.
- **Palettes** (PALETTE_OPTIONS): Sand, Clay, Sage, Slate, Ochre — each a few hex shades used to tint world tiles.
- **Hero worlds**: ~4, triggers matched from query text only (not from refine overrides).

This library is the single source of truth: it drives the resolver's matching *and* the refine carousels' options (no more hardcoded, disconnected `refineData` list).

## Resolver (`src/screens/search/resolveQuery.ts`)

`resolveQuery(rawText, refinements?: { theme?: id; palette?: id }) → Interpretation`

```
Interpretation = { query, family, palette, heroWorld?, chips[] }
```

1. Normalize text → tokens (lowercase, strip punctuation, drop stopwords).
2. **Hero pass** — a hero world whose trigger phrase's words are all present wins; supplies its family + palette.
3. **Family** — `refinements.theme` override → else hero's family → else best family by tag hits → else default (`warm`).
4. **Palette** — `refinements.palette` override → else hero's palette → else best palette by tag hits → else `family.defaultPaletteId`.
5. **Chips** — `[family.label, palette.label]` (+ up to one distinctive matched tag), deduped, ≤3. These echo the query back in the search chrome.

Refine facets are **hard constraints**; the typed query is a **soft signal**. Same resolver, two entry points.

## Results feed (`resultsFeedSource.ts`, `ResultsScreen.tsx`)

Feed generator is parametrized by the interpretation instead of a fixed label list:

- **Labels** composed from `family.settings × family.lights` ("Coastal veranda, first light").
- **Colour** — each tile tinted from `palette.colors`. This is the visible relevance signal.
- **Hero seeding** — if a hero world matched, section 0 leads with it as the full-width bespoke world; later sections keep the existing occasional random heroes.
- Flush-masonry machinery, infinite scroll, and tap→`/item` are unchanged.
- Tiles stay clearly placeholder (label on a tinted block) — honest-unfinished per plan §2.

`ResultsScreen`:
- `resolveQuery(q, { theme, palette })` (theme/palette arrive as params from Refine).
- Passes `interp.chips` to `SearchChrome`.
- Editable query field submits → `router.replace` results with new `q` (makes the field functional).
- Filter button → push `/search/refine` with `{ q, theme: family.id, palette: palette.id }` so refine opens on the current match.

## Refinement (`RefineScreen.tsx`, `RefineCarousel.tsx`, retire `refineData.ts`)

- Carousel options derived from `moodLibrary` (`FAMILIES`, `PALETTES`).
- `RefineScreen` computes `resolveQuery(q, {theme, palette})` to set the **initial** carousel positions to the current match.
- `RefineCarousel` gains an `onChange(index)` callback; screen tracks `themeIdx` / `paletteIdx`.
- Submitting the query field applies the refinement: `router.replace` results with `{ q, theme, palette }` (ids from the selected carousel indices).
- Chips reflect the current selection.

## What it results in

Type "a calm coastal morning" → chips read *Coastal · Sand*, the feed is sand/blue on-mood worlds led by bespoke "Slow coast morning", tap opens the View Item world. Open Refine → carousels sit on Coastal/Sand → switch THEME to Warm, PALETTE to Clay → submit → results narrow to warm/clay worlds. Off-script queries still return a coherent, tinted, on-aesthetic feed. Deterministic, offline, cannot fail mid-demo, zero photography.

## Non-goals

- Home "For You" feed stays recommendation-free (plan §1) — untouched.
- No Haiku wiring yet — it slots into `resolveQuery` later with no UI change.
- No real ranking/embeddings — curated metadata is the correct move at demo scale.
