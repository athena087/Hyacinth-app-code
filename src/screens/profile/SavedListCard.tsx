import { StyleSheet, Text, View } from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import type { SavedList } from './savedLists';

/**
 * A saved list: a bordered card with a 3-up thumbnail grid (placeholders for
 * now) and a title / piece-count row. Unlike the full-bleed home heroes, these
 * are carded — bordered with a soft radius per the mock.
 */
export function SavedListCard({ list }: { list: SavedList }) {
  const c = useTokens();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      <View style={styles.grid}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.thumb, { backgroundColor: c.hairline }]} />
        ))}
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: c.ink }]}>{list.title}</Text>
        <Text style={[styles.count, { color: c.ink, opacity: 0.55 }]}>
          {list.pieces} pieces
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
