import { useLocalSearchParams, useRouter } from 'expo-router';
import { CaretLeft, X } from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '../../saved/SavedContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * Board detail — a grid of the board's saved worlds + pieces. A root route (over
 * the tabs), so back returns to Profile. Tapping a tile reopens its world; the ✕
 * removes it from this board.
 */
export default function BoardDetailScreen() {
  const c = useTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { boards, unsave } = useSaved();
  const board = boards.find((b) => b.id === id);

  const open = (world?: string) => {
    if (world) router.push({ pathname: '/item', params: { world } });
  };

  const empty = !board || board.entries.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={6} style={styles.side}>
          <CaretLeft size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>
          {board?.title ?? 'Saved'}
        </Text>
        <View style={styles.side} />
      </View>
      {board ? (
        <Text style={[styles.count, { color: c.ink }]}>{board.entries.length} saved</Text>
      ) : null}

      {empty ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: c.ink }]}>Nothing saved here yet.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]}
        >
          {board.entries.map((e) => (
            <View key={e.key} style={styles.cell}>
              <Pressable onPress={() => open(e.world)}>
                <View style={[styles.tile, { backgroundColor: e.color }]}>
                  <Pressable
                    onPress={() => unsave(e.key, board.id)}
                    hitSlop={8}
                    style={[styles.remove, { backgroundColor: c.bg }]}
                  >
                    <X size={13} weight="bold" color={c.ink} />
                  </Pressable>
                </View>
                <Text style={[styles.tileTitle, { color: c.ink }]} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={[styles.tileSub, { color: c.ink }]} numberOfLines={1}>
                  {e.kind === 'world' ? 'World' : 'Piece'}
                  {e.subtitle ? ` · ${e.subtitle}` : ''}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
    paddingTop: space.sm,
  },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: 18 },
  count: {
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.55,
    paddingBottom: space.sm,
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: font.regular, fontSize: 15, opacity: 0.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  cell: { width: '50%', padding: 6 },
  tile: {
    height: 168,
    borderRadius: 12,
  },
  remove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: { marginTop: 8, fontFamily: font.semibold, fontSize: 14 },
  tileSub: { marginTop: 2, fontFamily: font.regular, fontSize: 12, opacity: 0.55 },
});
