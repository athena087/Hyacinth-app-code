# Home ("For You") page — design

## Source of truth
- Mock: `/Users/agsun/Hyacinth/design/project/Home For You.dc.html`
- Design system: `/Users/agsun/Hyacinth/Hyacinth Design System.pdf` (updated 2 July 2026)

## Goal
Build the app's Home screen as a static, non-networked screen matching the mock: a "For You" feed of full-bleed world hero cards with a floating bottom nav. Image content stays as labeled placeholders. No other screens/routes are built yet.

## Visual spec (from PDF + mock)

**Colors** (light / dark):
- background `#FAFAFA` / `#0E0E0E`
- surface `#FFFFFF` / `#1C1C1C`
- hairline `#E4E4E4` / `#2E2E2E`
- ink (primary text) `#1A1A1A` / `#F5F5F5`
- ink secondary: primary ink at reduced opacity (not a separate color) — `#707070` light / `#9A9A9A` dark used as reference only
- tint (soft fill) `#FCF6E6` / `#362D14`
- tint-ink (text/icon on tint) `#3D2E0A` / `#F6E199`
- brand "soul" `#F6E199` — not used on this screen (no buttons/brand seams here)

**Type** — Lilex, variable monospace, weights 400/500/600:
- Display/world title: 34px/600
- Title/section head: 22px/600 (unused on this screen)
- Subtitle/lede: 15px/400 (unused on this screen)
- Body: 14px/400 (unused on this screen)
- Metadata/caption: 13px/400 — the "N pieces · composed" captions
- Eyebrow/overline: 11px/600, 0.08em letter-spacing — the "FOR YOU" label
- Hierarchy is via size/weight/opacity, never a separate gray color.

**Spacing scale**: 4/8/12/16/24/32/48/64. Page margin 16px.

**Radius**: 6px (buttons/chips/inputs — n/a here), 8–10px (cards/sheets — n/a, hero photography is full-bleed/0px), 0px for hero photography.

**Iconography**: Phosphor, Regular by default, Fill for the active/saved state — this is the one exception to "never mix" in the design system. Nav icons: house, magnifying-glass, basket, user. Sizes 16/20/24 per system; nav uses 24-ish (mock uses 26px).

**Motion**: taps/toggles ~150ms ease-out (nav active-state swap). No bounce.

## Screen structure

Top to bottom, scrollable:
1. **Header** (surface background, page margin 16px sides, top padding driven by safe-area inset + 24px, not a hardcoded 76px like the mock's fixed-frame export):
   - Eyebrow: "FOR YOU"
   - H1: "Welcome back {userName}" — `userName` is a local placeholder constant for now (no auth/user data source exists yet).
2. **Feed**: repeating `WorldCard` for each world:
   - Full-bleed placeholder hero (aspect matches mock's 520px @ 430px-wide frame ≈ 1.21:1 height:width; implement as `width: 100%`, `aspectRatio` rather than a fixed px height, so it scales across device widths) with a centered placeholder label (e.g. "World hero — Sunroom, 3pm").
   - Caption row below, surface background, "{N} pieces · composed", 13px/opacity-secondary.
   - Three worlds, hardcoded: Sunroom 3pm/14, Slow coast morning/9, Reading nook dusk/11.
3. **Floating bottom nav** (position: absolute, bottom offset ~42px + safe-area, centered): pill container, surface bg, hairline border, shadow. 4 icon-only buttons (Home/Search/Basket/Profile). Active tab: 60px-wide pill with tint background + tint-ink Fill icon; inactive: 46px, transparent, ink-colored Regular icon. Tapping any tab updates which one is active (local state) — Search/Basket/Profile show the highlight only, no navigation/content since those screens don't exist yet.

## Theming
Follow system color scheme via `useColorScheme()`, switching between the light/dark token sets above. `app.json`'s `userInterfaceStyle` changes from `"light"` to `"automatic"` so dark mode is reachable on-device.

## Font loading
`@expo-google-fonts/lilex` + `expo-font`, loaded in `src/app/_layout.tsx` via `useFonts`, holding the splash screen (`expo-splash-screen`) until fonts resolve — the standard Expo pattern, avoids a system-font flash before Lilex loads.

## Out of scope (explicitly not building now)
- Search, Basket, Profile screens/routes
- Real images (Unsplash/CDN/etc.) — placeholders stay
- Real "for you" data/recommendation logic — hardcoded array
- Auth/user name source — hardcoded string
- Swipe-recompose, brand glint, world load/reveal motion signature moments from the PDF's Motion section
- Bottom sheet / "Buy this world" / search input components from the PDF's Components section — not present in this mock

## Files touched
- `app.json` — `userInterfaceStyle: "automatic"`
- `package.json` — new deps: `phosphor-react-native`, `react-native-svg`, `@expo-google-fonts/lilex`, `expo-font`, `expo-splash-screen`
- `src/theme/tokens.ts` — new: color tokens (light/dark), spacing, radii, font family name
- `src/components/WorldCard.tsx` — new
- `src/components/BottomNav.tsx` — new
- `src/app/_layout.tsx` — font loading + splash hold, hide default Stack header
- `src/app/index.tsx` — screen assembly
