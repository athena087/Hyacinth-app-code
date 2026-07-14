import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SearchChrome } from '../../components/SearchChrome';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { LEFT_COLUMN, RESULT_CHIPS, RIGHT_COLUMN, ResultTile } from './resultsData';

export default function ResultsScreen() {
  const c = useTokens();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  // Seed the editable search field from the query param; user can alter it here.
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');

  // Tapping a result opens the (static) View Item screen (root route, so back
  // returns here rather than switching tabs).
  const openItem = () => router.push('/item');

  const Column = ({ tiles, offset }: { tiles: ResultTile[]; offset?: number }) => (
    <View style={[styles.column, offset ? { marginTop: offset } : null]}>
      {tiles.map((tile) => (
        <Pressable
          key={tile.label}
          onPress={openItem}
          style={[styles.tile, { height: tile.height, backgroundColor: c.hairline }]}
        >
          <Text style={[styles.tileLabel, { color: c.ink }]}>{tile.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onBack={() => router.dismissAll()}
        onFilter={() => router.push({ pathname: '/search/refine', params: { q: query } })}
        chips={RESULT_CHIPS}
      />

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
