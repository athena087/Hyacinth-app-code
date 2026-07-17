import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import {
  Item,
  ItemDomain,
  matchingItems,
  PRICE_BANDS,
  PriceBand,
  RefineConstraints,
  SIZE_CAPS,
  SIZE_RUN,
  SizeCap,
} from './itemData';

/**
 * The Refine sheet — measurable, quantitative filters only (size / price /
 * dimensions), no chat and no qualitative controls. Every control is a numeric
 * range; the "AI" retrieves the matching pieces. A live count previews the
 * result before you apply.
 */
export function RefineSheet({
  visible,
  onClose,
  domain,
  items,
  initial,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  domain: ItemDomain;
  items: Item[];
  initial: RefineConstraints;
  onApply: (c: RefineConstraints) => void;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();

  const [sizes, setSizes] = useState<string[]>(initial.sizes);
  const [priceBand, setPriceBand] = useState<PriceBand | null>(initial.priceBand);
  const [sizeCap, setSizeCap] = useState<SizeCap | null>(initial.sizeCap);
  const [note, setNote] = useState(initial.note);

  // Reset controls to the currently-applied constraints each time it opens.
  useEffect(() => {
    if (visible) {
      setSizes(initial.sizes);
      setPriceBand(initial.priceBand);
      setSizeCap(initial.sizeCap);
      setNote(initial.note);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const cx: RefineConstraints = { sizes, priceBand, sizeCap, note };
  const count = matchingItems(items, cx, domain).length;

  const toggleSize = (l: string) =>
    setSizes((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));
  const clear = () => {
    setSizes([]);
    setPriceBand(null);
    setSizeCap(null);
    setNote('');
  };

  const Chip = ({ label, sub, on, onPress }: { label: string; sub?: string; on: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        on ? { backgroundColor: c.soul, borderColor: c.soul } : { backgroundColor: c.surface, borderColor: c.hairline },
      ]}
    >
      <Text style={[styles.chipLabel, { color: on ? c.onSoul : c.ink }]}>{label}</Text>
      {sub ? (
        <Text style={[styles.chipSub, { color: on ? c.onSoul : c.ink }]}>{sub}</Text>
      ) : null}
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.fill}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.handle, { backgroundColor: c.hairline }]} />
            <Text style={[styles.title, { color: c.ink }]}>Refine</Text>
            <Text style={[styles.sub, { color: c.ink }]}>
              Set your specifics — AI matches the best pieces.
            </Text>

            {domain === 'apparel' ? (
              <View style={styles.section}>
                <Text style={[styles.eyebrow, { color: c.ink }]}>SIZE</Text>
                <View style={styles.chips}>
                  {SIZE_RUN.map((s) => (
                    <Chip
                      key={s.label}
                      label={s.label}
                      sub={`${s.chest} cm`}
                      on={sizes.includes(s.label)}
                      onPress={() => toggleSize(s.label)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={[styles.eyebrow, { color: c.ink }]}>SIZE</Text>
                <View style={styles.chips}>
                  {SIZE_CAPS.map((cap) => (
                    <Chip
                      key={cap.label}
                      label={cap.label}
                      on={sizeCap?.label === cap.label}
                      onPress={() => setSizeCap(sizeCap?.label === cap.label ? null : cap)}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.eyebrow, { color: c.ink }]}>PRICE</Text>
              <View style={styles.chips}>
                {PRICE_BANDS[domain].map((band) => (
                  <Chip
                    key={band.label}
                    label={band.label}
                    on={priceBand?.label === band.label}
                    onPress={() => setPriceBand(priceBand?.label === band.label ? null : band)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.eyebrow, { color: c.ink }]}>ANYTHING SPECIFIC (OPTIONAL)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. needs pockets, for a wedding…"
                placeholderTextColor={c.ink + '8C'}
                style={[styles.note, { color: c.ink, backgroundColor: c.surface, borderColor: c.hairline }]}
                returnKeyType="done"
              />
            </View>

            <Text style={[styles.count, { color: c.ink }]}>
              {count} of {items.length} piece{items.length === 1 ? '' : 's'} match
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={clear} hitSlop={8} style={styles.clear}>
                <Text style={[styles.clearText, { color: c.ink }]}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onApply(cx);
                  onClose();
                }}
                disabled={count === 0}
                style={[styles.apply, { backgroundColor: c.ink, opacity: count === 0 ? 0.4 : 1 }]}
              >
                <Text style={[styles.applyText, { color: c.bg }]}>
                  {count === 0 ? 'No matches' : 'Confirm'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: space.md },
  title: { fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.01 * 22 },
  sub: { marginTop: 4, fontFamily: font.regular, fontSize: 14, opacity: 0.55 },
  section: { marginTop: space.lg },
  eyebrow: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 0.08 * 12, opacity: 0.55, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: font.semibold, fontSize: 14 },
  chipSub: { fontFamily: font.regular, fontSize: 11, opacity: 0.7, marginTop: 1 },
  note: {
    marginTop: 2,
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: font.regular,
    fontSize: 15,
  },
  count: {
    marginTop: space.lg,
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.6,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  clear: { paddingHorizontal: 8, paddingVertical: 12 },
  clearText: { fontFamily: font.medium, fontSize: 15, opacity: 0.7 },
  apply: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { fontFamily: font.semibold, fontSize: 15 },
});
