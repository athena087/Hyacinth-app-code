import { Trash } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Board } from '../../saved/SavedContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * A saved board: a bordered card with a 3-up thumbnail grid (tinted from the
 * board's first saved entries) and a title / count row. Taps open its detail;
 * the trash button (top-right) removes the whole board.
 */
export function SavedListCard({
  board,
  onPress,
  onDelete,
}: {
  board: Board;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const c = useTokens();
  const count = board.entries.length;

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      <View style={styles.grid}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.thumb, { backgroundColor: board.entries[i]?.color ?? c.hairline }]}
          />
        ))}
      </View>

      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={[styles.delete, { backgroundColor: c.bg, borderColor: c.hairline }]}
        >
          <Trash size={15} color={c.ink} />
        </Pressable>
      ) : null}
      <View style={styles.meta}>
        <Text style={[styles.title, { color: c.ink }]}>{board.title}</Text>
        <Text style={[styles.count, { color: c.ink, opacity: 0.55 }]}>
          {count} saved
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  delete: {
    position: 'absolute',
    top: space.md + 8,
    right: space.md + 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
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
