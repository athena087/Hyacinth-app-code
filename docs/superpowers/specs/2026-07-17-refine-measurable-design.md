# Refine with AI → measurable filters — design

**Date:** 2026-07-17
**Status:** draft, awaiting review
**Goal:** replace the "Refine with AI" chat with a structured, **measurable** filter
sheet. The user sets quantitative constraints (size, price, dimensions); the AI's
job is to **rank the surviving pieces by mood-fit**, not to converse.

## The organizing principle

Two layers, kept separate:

- **Qualitative / mood** ("cosy", "coastal", "relaxed") → lives **upstream**: search
  (mood-as-query) + the theme/palette refine. The fuzzy, expansive layer.
- **Quantitative / measurable** (size, price, dimensions) → lives **here**, in Refine.
  Every control resolves to a number or range — a piece either satisfies it or not.

This split is also what removes the chatbot: a *measurable* constraint can't be set by
describing a feeling, so the surface must be controls. The AI only orders what passes
the hard filter.

**Decision (this session):** qualitative controls are **excluded** — no "fit"
(slim/regular) and no "material" chips. Refine is numeric-only.

## Surface

A **bottom sheet** raised from the item page's "Refine" bar (swipe-down / scrim to
dismiss), like the Explore sheet. Controls **adapt to the item's domain**:

### Apparel item
- **Size** — chips XS–XXL, each labelled with its measurement (e.g. *M · chest 100 cm*),
  multi-select → a measurable range.
- **Price** — £ min–max range.

### Object item (furniture / decor)
- **Dimensions** — Width / Depth / Height cm ranges (so it fits a space).
- **Price** — £ min–max range.

### Both
- **Optional line** — one field: *"Anything specific? (optional)"* for the long tail.
- **Action** — a primary button with a **live count** ("Show 14 matches") that updates
  as controls move. Applying filters to pieces meeting **every** measurable constraint
  and ranks the survivors best-mood-fit-first.

## The AI's role (pre-YC = simulated)

Hard measurable constraints are non-negotiable **filters**. The AI **ranks** what
survives by mood-fit (+ the optional text as a soft nudge). Pre-YC this ranking is a
deterministic local heuristic (no LLM) — same honest-simulation stance as the rest of
the demo. The interface is identical if/when Claude is wired in later; only the ranking
function is swapped.

## Data model changes (the real work)

Today a piece carries human-readable strings (`price: "£1,240"`, `size: "W 168 · D 88 cm"`)
— not filterable. `buildWorldItems` must emit **structured** fields:

- `priceValue: number` on every style (always).
- `domain: 'apparel' | 'object'` per category.
- Object styles: `dims: { w: number; d: number; h: number }` (cm).
- Apparel styles: `sizes: Size[]` where `Size = { label; chestCm; ... }`.

The existing display strings are derived from these, so the panels don't regress.

## Clothing as a real domain

Filtering *clothing* by size requires clothing to be a real item category — today the
generator only makes furniture. So:

- Add **apparel categories** (e.g. Jacket, Knit, Shirt, Trousers, Dress) with size runs,
  tagged `domain: 'apparel'`.
- A world composes from **one domain**. The domain is decided by the world's origin: the
  clothing hero worlds (and any apparel-tagged family) → `apparel`; everything else →
  `object`. Passed to `/item` alongside `world/family/palette`.

## What updates on apply

The world's pieces (the breakdown collage + the focused item's variants) are filtered to
those meeting the constraints and reordered by mood-fit. The count reflects the filtered
set.

## Phasing (recommended)

1. **Sheet + object filtering** — bottom sheet, Dimensions + Price, structured numeric
   fields, deterministic ranking. Proves the whole mechanism on existing (object) data.
2. **Apparel domain** — clothing categories + size runs + domain routing, so clothing
   worlds show garments and Refine shows Size + Price.

## Non-goals

- No real LLM ranking pre-YC (deterministic heuristic).
- No qualitative controls (material/fit) — excluded by the measurable principle.
- The upstream mood/theme/palette refine is unchanged.
