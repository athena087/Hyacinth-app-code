# View Item — per-world items logic

How the View Item screen composes a **different set of items for every world**, with
no real photography and no hand-authored per-world data.

## The idea in one line

A world is identified by its **name**. That name → a mood **family** + **palette** +
a deterministic **seed**. The seed picks a distinct-but-stable set of pieces from the
family's material pool; the palette tints the placeholders. Same world ⇒ same items,
always; different worlds ⇒ different items.

## Data flow

```
tap a world tile                     ViewItemScreen                     panels
──────────────────                   ──────────────                     ──────
Results:  world=label,               read params ─┐
          family=id, palette=id                   ├─► resolve family + palette
Home:     world=label ───────────────► (params)   │      (explicit, else inferred
                                                   │       from the name via
                                                   │       resolveQuery)
                                                   ▼
                                        buildWorldItems(familyId,
                                          paletteId, seed=worldName)
                                                   │
                                     { items, palette } ──► OverviewPanel (tint + name)
                                                        └─► BreakdownPanel (items + palette)
```

### 1. The tap passes the world's identity (`/item` params)

- **Results** (`ResultsScreen.openItem`) — passes `world` (the tile's label) plus the
  search's resolved `family` and `palette` ids (`themeIds[0] ?? base.family.id`, and
  the palette likewise). So the item theme matches the search that produced the world.
- **Home** (`HomeScreen.openItem`) — passes only `world` (the world's hero label). The
  Home "For You" feed has no family, so the item screen infers one from the name.

### 2. `ViewItemScreen` resolves family + palette, then builds

```ts
const fam = familyById(family) ?? resolveQuery(worldName).family;
const pal = paletteById(palette) ?? resolveQuery(worldName).palette;
const built = buildWorldItems(fam.id, pal.id, worldName || fam.id);
```

- Explicit `family`/`palette` params win (Results path).
- Otherwise the world **name is run through `resolveQuery`** — the same mood matcher
  used by search — to infer a family + palette (Home path, or a direct/unparametrised
  visit). Falls back to the default family (`warm`) if the name matches nothing.
- Wrapped in `useMemo` keyed on `[worldName, family, palette]`, so it only rebuilds
  when the world changes.

## The generator — `buildWorldItems(familyId, paletteId, seed)`

Lives in `src/screens/item/itemData.ts`. Returns `{ items: Item[]; palette: string[] }`.

### Inputs it draws from

- **`CATEGORIES`** — 7 archetype slots (Sofa, Chair, Lamp, Rug, Table, Vase, Shelf),
  each with a `tag`, candidate `sizes`, and a price `base` + `vary` range.
- **`FAMILY_STYLE[familyId]`** — the family's flavour: a list of `materials`
  (`{ adj, full }`, e.g. `{ adj: 'Linen', full: 'Belgian slub linen' }`) and named
  colourway `swatches` (`{ n, sw }`). One entry per mood family; `warm` is the default.
- **`paletteById(paletteId).colors`** — the world's palette hexes, used for the collage
  swatch row and the overview tints.

### The algorithm

1. **Seed a PRNG from the world name** — `hashSeed` (FNV-1a) → `mulberry32`. This is
   what makes the output *deterministic per world*.
2. **Pick 5 of 7 categories** — `shuffled(CATEGORIES, rand).slice(0, 5)`.
3. **For each category, build 3 swappable styles** — take 3 distinct materials from the
   family (`shuffled(...).slice(0, 3)`); each style is:
   - `name` = `${material.adj} ${category.label}` (e.g. "Linen Sofa"),
   - `material` = `material.full`, `tag` = `category.tag`,
   - `size` = a random pick from the category's sizes,
   - `price` = `base + round(rand·vary / 10)·10` → `formatPrice`,
   - `colours` = 2–3 swatches from the family (`shuffled(swatches).slice(0, 2|3)`).
4. **Palette** = the resolved palette's colours (or a neutral default).

All randomness comes from the one seeded `rand()`, so the whole item set is a pure
function of `(familyId, paletteId, worldName)`.

## How the panels consume it

- **`OverviewPanel`** (`{ world, palette }`) — tints its hero + detail placeholders by
  cycling the palette, and shows the world's name in the hero.
- **`BreakdownPanel`** (`{ items, palette }`) — renders the collage chips from `items`,
  the palette row from `palette`, and the chosen item's swappable styles / colourways /
  add-to-basket. Its selection state (`selItem`, `styleIdx`, `colourIdx`) resets
  naturally because a new world remounts the screen.

## Determinism & why it matters

The world **name is the only source of entropy**. Consequences:

- Re-opening the same world (or re-rendering) yields the **same items** — no flicker,
  no "the sofa changed."
- Two different worlds — even within the same family/palette — get **different** sets,
  because their names hash differently.
- No database or per-world authoring is needed; the family pools + the seed cover it.

## Material ↔ category matching

Every material is tagged with a **`kind`** (`soft | wood | metal | ceramic | stone |
glass | weave`), and every category lists the `kinds` it can be made of:

| Category | Accepts kinds |
|---|---|
| Sofa | soft |
| Chair | soft, wood, weave |
| Lamp | metal, ceramic, glass, wood |
| Rug | weave, soft |
| Table | wood, stone, metal, ceramic |
| Vase | ceramic, glass, stone |
| Shelf | wood, metal |

When composing a category, the generator filters the family's materials to the
matching kinds before the seeded pick, so pairings stay plausible (a Sofa is only
upholstery, a Vase only ceramic/glass/stone — never an "Ink Ceramic Sofa").

Each family carries a **balanced 8-material spread** (2 soft, 2 wood, 1 metal, 1
ceramic, 1 glass/stone, 1 weave), which guarantees at least **2 swappable styles**
for every category. If a family were ever thin on a kind, the generator falls back to
the full material list so a category never renders fewer than two styles.
