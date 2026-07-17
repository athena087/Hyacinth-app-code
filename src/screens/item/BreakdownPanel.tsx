import { Basket, Check, Heart, Plus, Sparkle } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../cart/CartContext';
import { SavedEntry, useSaved } from '../../saved/SavedContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { BagItem } from '../bag/bagData';
import {
  EMPTY_CONSTRAINTS,
  formatPrice,
  hasConstraints,
  Item,
  ItemDomain,
  matchingItems,
  parsePrice,
  RefineConstraints,
} from './itemData';
import { RefineSheet } from './RefineSheet';
import { SaveSheet } from './SaveSheet';

/**
 * Panel 2 — the breakdown: a collage of the look's items (tap to focus one), a
 * palette row and "add all" bundle button, then the chosen item's swappable
 * style (swipe or dots), colourways, and add-to-basket. Mirrors the design's
 * selItem / styleIdx / colourIdx state model.
 */
export function BreakdownPanel({
  width,
  items,
  palette,
  domain,
  world,
  familyId,
  paletteId,
  focusPiece,
}: {
  width: number;
  items: Item[];
  palette: string[];
  domain: ItemDomain;
  world: string;
  familyId: string;
  paletteId: string;
  /** A style name to focus on mount (a piece reopened from the bag). */
  focusPiece?: string;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const { isSaved } = useSaved();
  const { add: addToCart, remove: removeFromCart, has: inCart } = useCart();
  const [saveOpen, setSaveOpen] = useState(false);

  // Measurable refine — the applied constraints filter the pieces shown.
  const [refineOpen, setRefineOpen] = useState(false);
  const [constraints, setConstraints] = useState<RefineConstraints>(EMPTY_CONSTRAINTS);
  const refined = hasConstraints(constraints);
  const view = useMemo(
    () => (refined ? matchingItems(items, constraints, domain) : items),
    [items, constraints, domain, refined],
  );
  const shown = view.length ? view : items;

  const [selItem, setSelItem] = useState(0);
  const [styleIdx, setStyleIdx] = useState<Record<number, number>>({});
  const [colourIdx, setColourIdx] = useState<Record<string, number>>({});

  // Reopened from the bag on a specific piece → focus its category + style.
  useEffect(() => {
    if (!focusPiece) return;
    for (let i = 0; i < items.length; i += 1) {
      const s = items[i].styles.findIndex((st) => st.name === focusPiece);
      if (s >= 0) {
        setSelItem(i);
        setStyleIdx((prev) => ({ ...prev, [i]: s }));
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPiece]);

  const styleFor = (i: number) => styleIdx[i] ?? 0;
  const ckey = (i: number, s: number) => `${i}:${s}`;
  const colourFor = (i: number, s: number) => colourIdx[ckey(i, s)] ?? 0;

  const item = shown[selItem] ?? shown[0];
  const si = styleFor(selItem);
  const style = item.styles[si];
  const ci = colourFor(selItem, si);
  const colour = style.colours[ci];

  // Saving the focused individual piece.
  const itemEntry: SavedEntry = {
    key: `item:${world}:${style.name}`,
    kind: 'item',
    title: style.name,
    subtitle: style.price,
    color: colour.sw,
    world,
  };
  const itemSaved = isSaved(itemEntry.key);

  const setStyle = (i: number) =>
    setStyleIdx((prev) => ({ ...prev, [selItem]: (i + item.styles.length) % item.styles.length }));
  const setColour = (i: number) =>
    setColourIdx((prev) => ({ ...prev, [ckey(selItem, si)]: i }));

  const bundleTotal = useMemo(
    () => shown.reduce((sum, m, i) => sum + parsePrice(m.styles[styleFor(i)].price), 0),
    [shown, styleIdx],
  );

  // Applying refine resets the focused piece + its per-piece style/colour state,
  // since the visible set (and thus indices) changes.
  const applyRefine = (cx: RefineConstraints) => {
    setConstraints(cx);
    setSelItem(0);
    setStyleIdx({});
    setColourIdx({});
  };

  // Add / remove the focused piece and the whole look to the bag.
  const itemBagId = `cart:item:${world}:${style.name}`;
  const bagItem: BagItem = {
    id: itemBagId,
    bundle: false,
    kind: 'Item',
    name: style.name,
    meta: `${colour.n} · ${style.material}`,
    price: style.price,
    images: [item.label],
    world,
    family: familyId,
    palette: paletteId,
  };
  const itemInCart = inCart(itemBagId);
  const toggleItem = () => (itemInCart ? removeFromCart(itemBagId) : addToCart(bagItem));

  const lookBagId = `cart:look:${world}`;
  const bagLook: BagItem = {
    id: lookBagId,
    bundle: true,
    kind: `Look · ${shown.length} pieces`,
    name: world || 'This look',
    meta: shown.map((m) => m.label).join(', '),
    price: formatPrice(bundleTotal),
    images: shown.map((m) => m.label),
    world,
    family: familyId,
    palette: paletteId,
  };
  const lookInCart = inCart(lookBagId);
  const toggleLook = () => (lookInCart ? removeFromCart(lookBagId) : addToCart(bagLook));

  // The chosen item's styles are a native horizontal pager: swipe the image to
  // move through the styles (image + specs update together); dots mirror the page
  // and jump to it. pageW is the detail's inner width (padding 16 each side).
  const pageW = width - 32;
  const styleScrollRef = useRef<ScrollView>(null);

  // Realign the pager to the selected style whenever the item changes.
  useEffect(() => {
    styleScrollRef.current?.scrollTo({ x: si * pageW, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selItem, pageW]);

  const goStyle = (i: number) => {
    setStyle(i);
    styleScrollRef.current?.scrollTo({ x: i * pageW, animated: true });
  };
  const onStyleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / pageW);
    if (page !== si) setStyle(page);
  };

  return (
    <ScrollView
      style={[styles.panel, { width, backgroundColor: c.bg }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
    >
      {/* ── Collage: item chips + palette + add all ── */}
      <View style={[styles.collage, { backgroundColor: c.tint }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {shown.map((m, i) => {
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
            {palette.map((sw) => (
              <View key={sw} style={[styles.paletteSw, { backgroundColor: sw }]} />
            ))}
          </View>
        </View>

        <Pressable
          onPress={toggleLook}
          style={[styles.bundleBtn, { backgroundColor: c.soul }]}
        >
          {lookInCart ? (
            <Check size={19} weight="bold" color={c.onSoul} />
          ) : (
            <Plus size={19} weight="bold" color={c.onSoul} />
          )}
          <Text style={[styles.bundleText, { color: c.onSoul }]}>
            {lookInCart ? 'Added to bag' : `Add all · ${formatPrice(bundleTotal)}`}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: c.hairline }]} />

      {/* ── Chosen item ── */}
      <View style={styles.detail}>
        <View style={styles.imageWrap}>
          <ScrollView
            ref={styleScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onStyleScrollEnd}
            style={{ width: pageW }}
          >
            {item.styles.map((s) => (
              <View
                key={s.img}
                style={[styles.styleImg, { width: pageW, backgroundColor: c.hairline }]}
              >
                <Text style={[styles.slotLabel, { color: c.ink }]}>{s.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Save this piece — floats just below the image's bottom-right. */}
          <Pressable
            onPress={() => setSaveOpen(true)}
            hitSlop={8}
            style={[styles.saveBtn, { backgroundColor: c.bg, borderColor: c.hairline }]}
          >
            <Heart size={22} weight={itemSaved ? 'fill' : 'regular'} color={itemSaved ? c.soul : c.ink} />
          </Pressable>
        </View>

        <View style={styles.styleDots}>
          {item.styles.map((s, i) => (
            <Pressable
              key={s.img}
              onPress={() => goStyle(i)}
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
          onPress={toggleItem}
          style={[styles.itemBtn, { backgroundColor: c.ink }]}
        >
          {itemInCart ? (
            <Check size={19} weight="bold" color={c.bg} />
          ) : (
            <Basket size={19} color={c.bg} />
          )}
          <Text style={[styles.itemBtnText, { color: c.bg }]}>
            {itemInCart ? 'Added to basket' : `Add to basket · ${style.price}`}
          </Text>
        </Pressable>
      </View>

      {/* ── Refine with AI — opens the measurable filter sheet ── */}
      <View style={styles.aiWrap}>
        <Pressable
          onPress={() => setRefineOpen(true)}
          style={[styles.aiPill, { backgroundColor: c.surface, borderColor: c.hairline }]}
        >
          <Sparkle size={20} weight="fill" color={c.soul} />
          <Text
            style={[styles.aiText, { color: c.ink, opacity: refined ? 1 : 0.55 }]}
            numberOfLines={1}
          >
            {refined ? 'Adjust refinements' : 'Refine with AI — size, price & specifics'}
          </Text>
        </Pressable>
      </View>

      <RefineSheet
        visible={refineOpen}
        onClose={() => setRefineOpen(false)}
        domain={domain}
        items={items}
        initial={constraints}
        onApply={applyRefine}
      />

      <SaveSheet visible={saveOpen} onClose={() => setSaveOpen(false)} entry={itemEntry} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1 },
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
  imageWrap: {
    // Wraps the style pager so the save button can hang off its bottom-right.
    alignSelf: 'stretch',
  },
  styleImg: {
    height: 236,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute',
    right: 10,
    bottom: -14, // sits just below the image's bottom-right corner
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  aiText: { flex: 1, fontFamily: font.regular, fontSize: 14, padding: 0 },
});
