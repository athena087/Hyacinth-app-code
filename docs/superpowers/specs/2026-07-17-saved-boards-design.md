# Saved boards (Pinterest-style) — design

**Date:** 2026-07-17
**Status:** draft, awaiting go-ahead
**Goal:** let the user save a **world** or an **individual item** from View Item into
one of several named **boards** (like Pinterest), viewable on Profile. Device-local,
built behind an interface so real accounts swap in later.

## What already exists (we wire into it)

- **Profile → "Saved Lists"** — `SAVED_LISTS` (static) rendered by `SavedListCard`
  (title + piece count + 3-up thumbnail grid). The board concept + viewing surface are
  already designed; this makes them real.
- **`CartProvider`** — the pattern for global cross-screen state.
- **`useRecentSearches`** — the pattern for device-local AsyncStorage persistence behind
  a swappable interface.

## Data model

```ts
type SavedEntry = {
  key: string;              // unique: `world:<name>` or `item:<world>:<style>`
  kind: 'world' | 'item';
  title: string;
  subtitle?: string;        // e.g. price (item) or "N pieces" (world)
  color: string;            // thumbnail tint (from the world/item palette)
};

type Board = { id: string; title: string; entries: SavedEntry[] };
```

An entry may live in several boards (Pinterest allows it); within a board, keyed unique.

## SavedProvider (global Context, AsyncStorage-backed)

Wrap the app next to `CartProvider`. Loads boards on mount; writes through on change.
Seeded with a few empty default boards (reusing the existing titles: "Sunlit rooms",
"Coastal calm", "Reading nooks") so the picker isn't empty.

```ts
useSaved(): {
  boards: Board[];
  boardsForKey(key): string[];       // which boards contain it (picker checks)
  isSaved(key): boolean;             // any board → filled heart
  save(entry, boardId): void;
  unsave(key, boardId): void;
  createBoard(title): string;        // returns new id
}
```

Storage key `hyacinth.savedBoards`. If storage is unavailable it degrades to an
in-memory session (same as recent searches).

## View Item — the save affordances

- **World** — a heart button floats **top-right** of `ViewItemScreen` (mirroring the
  top-left back button; the page-dots stay centre). Filled when the world is saved
  anywhere. Tapping opens the SaveSheet for the world entry
  (`{ kind:'world', title: worldName, subtitle: 'N pieces', color: palette[0] }`).
- **Item** — a heart button on the breakdown's focused piece (in the name/price row).
  Tapping opens the SaveSheet for that style
  (`{ kind:'item', title: style.name, subtitle: style.price, color: style.colours[0] }`).

## SaveSheet (the board picker)

A bottom sheet (Modal, like `RefineSheet`):
- Title "Save to…" + the entry title.
- A row per board with a check where the entry is already saved; tapping toggles
  save/unsave **in that board**.
- A "New list" row → inline text input; creating a board also saves the entry to it.
- Dismiss on scrim.

## Profile — make it real

`ProfileScreen` reads `boards` from `useSaved` instead of `SAVED_LISTS`. `SavedListCard`
shows the real title, `entries.length` count, and tints its 3 thumbs from the first
entries' colours (hairline when fewer).

## Phasing

1. **This build** — SavedProvider + persistence, the two save affordances, the SaveSheet
   picker + create-list, and a dynamic Profile.
2. **Follow-up** — board **detail** screen (tap a board → grid of its saved worlds/items).

## Non-goals

- No backend / accounts (device-local; interface ready for later).
- No board detail view yet (phase 2), no drag-reorder, no cover-image picking.
