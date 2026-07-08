import { useLocalSearchParams, useRouter } from 'expo-router';
import { CaretLeft, MagnifyingGlass, SlidersHorizontal, X } from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { LEFT_COLUMN, RESULT_CHIPS, RIGHT_COLUMN, ResultTile } from './resultsData';

export default function ResultsScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = typeof q === 'string' ? q : '';

  const Column = ({ tiles, offset }: { tiles: ResultTile[]; offset?: number }) => (
    <View style={[styles.column, offset ? { marginTop: offset } : null]}>
      {tiles.map((tile) => (
        <View
          key={tile.label}
          style={[styles.tile, { height: tile.height, backgroundColor: c.hairline }]}
        >
          <Text style={[styles.tileLabel, { color: c.ink }]}>{tile.label}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Search chrome */}
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.searchRow}>
          <Pressable onPress={() => router.back()} hitSlop={6} style={styles.iconBtn}>
            <CaretLeft size={26} color={c.ink} />
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={[styles.field, { backgroundColor: c.surface, borderColor: c.hairline }]}
          >
            <MagnifyingGlass size={20} color={c.ink} style={{ opacity: 0.55 }} />
            <Text style={[styles.query, { color: c.ink }]} numberOfLines={1}>
              {query}
            </Text>
          </Pressable>
          <Pressable hitSlop={6} style={styles.iconBtn}>
            <SlidersHorizontal size={24} color={c.ink} />
          </Pressable>
        </View>

        <View style={styles.chips}>
          {RESULT_CHIPS.map((label) => (
            <View key={label} style={[styles.chip, { backgroundColor: c.soul }]}>
              <X size={12} color={c.onSoul} style={styles.chipX} />
              <Text style={[styles.chipText, { color: c.onSoul }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Masonry */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.masonry}>
          <Column tiles={LEFT_COLUMN} />
          <Column tiles={RIGHT_COLUMN} offset={52} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: 14,
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
  },
  query: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipX: {
    position: 'absolute',
    top: 5,
    left: 7,
    opacity: 0.6,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 13,
  },
  scroll: { flex: 1 },
  masonry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: space.lg,
    paddingTop: 4,
    paddingBottom: 128, // clear the floating nav
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  tile: {
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.55,
  },
});
