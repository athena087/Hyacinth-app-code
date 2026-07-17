import { StyleSheet, Text, View } from 'react-native';
import type { Board } from '../../saved/SavedContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * A saved board: a bordered card with a 3-up thumbnail grid (tinted from the
 * board's first saved entries) and a title / count row.
 */
export function SavedListCard({ board }: { board: Board }) {
  const c = useTokens();
  const count = board.entries.length;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      <View style={styles.grid}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.thumb, { backgroundColor: board.entries[i]?.color ?? c.hairline }]}
          />
        ))}
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: c.ink }]}>{board.title}</Text>
        <Text style={[styles.count, { color: c.ink, opacity: 0.55 }]}>
          {count} saved
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18, // per mock (larger than the DS card default)
    padding: space.md,
  },
  grid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  thumb: {
    flex: 1,
    height: 106,
    borderRadius: 9,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: space.md,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: 16,
  },
  count: {
    fontFamily: font.regular,
    fontSize: 13,
  },
});
