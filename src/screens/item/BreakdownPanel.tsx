import { Basket, Check, Plus, Sparkle } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { formatPrice, ITEMS, PALETTE, parsePrice } from './itemData';

const FLASH_MS = 1300;

/**
 * Panel 2 — the breakdown: a collage of the look's items (tap to focus one), a
 * palette row and "add all" bundle button, then the chosen item's swappable
 * style (swipe or dots), colourways, and add-to-basket. Mirrors the design's
 * selItem / styleIdx / colourIdx state model.
 */
export function BreakdownPanel({ width }: { width: number }) {
  const c = useTokens();

  const [selItem, setSelItem] = useState(0);
  const [styleIdx, setStyleIdx] = useState<Record<number, number>>({});
  const [colourIdx, setColourIdx] = useState<Record<string, number>>({});
  const [flashItem, setFlashItem] = useState(false);
  const [flashBundle, setFlashBundle] = useState(false);

  const itemTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bundleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => {
    clearTimeout(itemTimer.current);
    clearTimeout(bundleTimer.current);
  }, []);

  const styleFor = (i: number) => styleIdx[i] ?? 0;
  const ckey = (i: number, s: number) => `${i}:${s}`;
  const colourFor = (i: number, s: number) => colourIdx[ckey(i, s)] ?? 0;

  const item = ITEMS[selItem];
  const si = styleFor(selItem);
  const style = item.styles[si];
  const ci = colourFor(selItem, si);
  const colour = style.colours[ci];

  const setStyle = (i: number) =>
    setStyleIdx((prev) => ({ ...prev, [selItem]: (i + item.styles.length) % item.styles.length }));
  const cycleStyle = (dir: number) => setStyle(si + dir);
  const setColour = (i: number) =>
    setColourIdx((prev) => ({ ...prev, [ckey(selItem, si)]: i }));

  const bundleTotal = useMemo(
    () => ITEMS.reduce((sum, m, i) => sum + parsePrice(m.styles[styleFor(i)].price), 0),
    [styleIdx],
  );

  const flash = (
    set: (v: boolean) => void,
    timer: { current: ReturnType<typeof setTimeout> | undefined },
  ) => {
    clearTimeout(timer.current);
    set(true);
    timer.current = setTimeout(() => set(false), FLASH_MS);
  };

  // Swipe the style image to cycle styles (claims horizontal gestures so the
  // parent pager doesn't steal them). No live drag — the design swaps on release.
  // Re-created per selection so the release handler cycles the current item.
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 8,
        onPanResponderRelease: (_e, g) => {
          if (g.dx < -40) cycleStyle(1);
          else if (g.dx > 40) cycleStyle(-1);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selItem, si],
  );

  return (
    <ScrollView
      style={[styles.panel, { width, backgroundColor: c.bg }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* ── Collage: item chips + palette + add all ── */}
      <View style={[styles.collage, { backgroundColor: c.tint }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {ITEMS.map((m, i) => {
            const on = i === selItem;
            return (
              <Pressable key={m.label} onPress={() => setSelItem(i)} style={styles.chip}>
                <View
                  style={[
                    styles.chipImg,
                    { backgroundColor: c.hairline, borderColor: on ? c.ink : c.surface },
                  ]}
                >
                  <Text style={[styles.slotLabel, { color: c.ink }]}>{m.label}</Text>
                </View>
                <Text
                  style={[
                    styles.chipName,
                    { color: c.ink, opacity: on ? 1 : 0.55, fontFamily: on ? font.semibold : font.medium },
                  ]}
                  numberOfLines={1}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.paletteRow}>
          <Text style={[styles.eyebrow, { color: c.ink }]}>PALETTE</Text>
          <View style={styles.swatches}>
            {PALETTE.map((sw) => (
              <View key={sw} style={[styles.paletteSw, { backgroundColor: sw }]} />
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => flash(setFlashBundle, bundleTimer)}
          style={[styles.bundleBtn, { backgroundColor: c.soul }]}
        >
          {flashBundle ? (
            <Check size={19} weight="bold" color={c.onSoul} />
          ) : (
            <Plus size={19} weight="bold" color={c.onSoul} />
          )}
          <Text style={[styles.bundleText, { color: c.onSoul }]}>
            {flashBundle ? 'Added' : `Add all · ${formatPrice(bundleTotal)}`}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: c.hairline }]} />

      {/* ── Chosen item ── */}
      <View style={styles.detail}>
        <View {...swipe.panHandlers} style={[styles.styleImg, { backgroundColor: c.hairline }]}>
          <Text style={[styles.slotLabel, { color: c.ink }]}>{item.label}</Text>
        </View>

        <View style={styles.styleDots}>
          {item.styles.map((s, i) => (
            <Pressable
              key={s.img}
              onPress={() => setStyle(i)}
              hitSlop={6}
              style={[
                styles.dot,
                { width: i === si ? 20 : 7, backgroundColor: i === si ? c.ink : c.hairline },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.eyebrow, styles.tag, { color: c.ink }]}>{style.tag}</Text>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: c.ink }]}>{style.name}</Text>
          <Text style={[styles.price, { color: c.ink }]}>{style.price}</Text>
        </View>
        <Text style={[styles.meta, { color: c.ink }]}>
          {style.material} · {style.size}
        </Text>

        <View style={styles.colourBlock}>
          <Text style={[styles.eyebrow, { color: c.ink }]}>COLOUR · {colour.n}</Text>
          <View style={styles.colourRow}>
            {style.colours.map((col, i) => (
              <Pressable
                key={col.n}
                onPress={() => setColour(i)}
                style={[
                  styles.colourSw,
                  {
                    backgroundColor: col.sw,
                    borderColor: i === ci ? c.ink : c.hairline,
                    borderWidth: i === ci ? 2 : 1,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => flash(setFlashItem, itemTimer)}
          style={[styles.itemBtn, { backgroundColor: c.ink }]}
        >
          {flashItem ? (
            <Check size={19} weight="bold" color={c.bg} />
          ) : (
            <Basket size={19} color={c.bg} />
          )}
          <Text style={[styles.itemBtnText, { color: c.bg }]}>
            {flashItem ? 'Added to basket' : `Add to basket · ${style.price}`}
          </Text>
        </Pressable>
      </View>

      {/* ── Refine with AI (static) ── */}
      <View style={styles.aiWrap}>
        <View style={[styles.aiPill, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Sparkle size={20} weight="fill" color={c.soul} />
          <Text style={[styles.aiText, { color: c.ink }]} numberOfLines={1}>
            Refine with AI — ask for a closer match…
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1 },
  content: { paddingBottom: 128 }, // clear the floating bottom nav so the AI bar is fully visible
  slotLabel: { fontFamily: font.regular, fontSize: 12, opacity: 0.55 },

  collage: {
    paddingTop: 106,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  chipRow: { gap: 14, paddingBottom: 4 },
  chip: { width: 132, alignItems: 'center', gap: 9 },
  chipImg: {
    width: 132,
    height: 132,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: { fontSize: 13, maxWidth: 132 },

  paletteRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatches: { flexDirection: 'row', gap: 8 },
  paletteSw: { width: 24, height: 24, borderRadius: 7 },

  bundleBtn: {
    marginTop: 20,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bundleText: { fontFamily: font.semibold, fontSize: 15 },

  divider: { height: 1 },

  detail: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 22 },
  styleImg: {
    width: '100%',
    height: 236,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleDots: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  dot: { height: 7, borderRadius: 4 },

  eyebrow: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 0.08 * 12, opacity: 0.55 },
  tag: { marginTop: 16 },
  nameRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: { flex: 1, fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.01 * 22 },
  price: { fontFamily: font.semibold, fontSize: 20 },
  meta: { marginTop: 8, fontFamily: font.regular, fontSize: 13, opacity: 0.55, lineHeight: 20 },

  colourBlock: { marginTop: 18 },
  colourRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  colourSw: { width: 30, height: 30, borderRadius: 15 },

  itemBtn: {
    marginTop: 22,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemBtnText: { fontFamily: font.semibold, fontSize: 15 },

  aiWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  aiPill: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiText: { flex: 1, fontFamily: font.regular, fontSize: 14, opacity: 0.55 },
});
