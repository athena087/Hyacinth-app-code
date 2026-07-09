import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { font } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/** A labelled placeholder box standing in for photography. */
function Slot({ label, style }: { label: string; style?: object }) {
  const c = useTokens();
  return (
    <View style={[styles.slot, { backgroundColor: c.hairline }, style]}>
      <Text style={[styles.slotLabel, { color: c.ink }]}>{label}</Text>
    </View>
  );
}

/**
 * Panel 1 — the overview: a full-width hero of the look, then a three-up detail
 * grid (one tall tile on the left, two stacked on the right). Scrolls vertically
 * inside the horizontal pager.
 */
export function OverviewPanel({ width }: { width: number }) {
  const c = useTokens();
  return (
    <ScrollView
      style={[styles.panel, { width, backgroundColor: c.bg }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Slot label="The look" style={styles.hero} />

      <View style={styles.grid}>
        <Slot label="Detail" style={styles.tall} />
        <View style={styles.stack}>
          <Slot label="Detail" style={styles.small} />
          <Slot label="Detail" style={styles.small} />
        </View>
      </View>
    </ScrollView>
  );
}

const GAP = 10;
const ROW = 176;

const styles = StyleSheet.create({
  panel: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: { width: '100%', height: 480, borderRadius: 0 },
  grid: {
    flexDirection: 'row',
    gap: GAP,
    padding: 14,
  },
  tall: { flex: 1, height: ROW * 2 + GAP, borderRadius: 12 },
  stack: { flex: 1, gap: GAP },
  small: { width: '100%', height: ROW, borderRadius: 12 },
  slot: { alignItems: 'center', justifyContent: 'center' },
  slotLabel: { fontFamily: font.regular, fontSize: 13, opacity: 0.55 },
});
