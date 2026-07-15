import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SearchChrome } from '../../components/SearchChrome';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { RESULT_CHIPS } from './resultsData';
import {
  createResultsFeed,
  ResultFeedTile,
  ResultSection,
} from './resultsFeedSource';

const INITIAL = 4;
const PAGE = 3;
const END_THRESHOLD = 600; // px from the bottom that triggers the next append

export default function ResultsScreen() {
  const c = useTokens();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  // Seed the editable search field from the query param; user can alter it here.
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');

  // Endless masonry, seeded with the original tiles so the top is unchanged.
  const source = useRef(createResultsFeed()).current;
  const [sections, setSections] = useState<ResultSection[]>(() => source.next(INITIAL));

  // Guard so a burst of near-bottom scroll events appends only one batch.
  const busy = useRef(false);
  useEffect(() => {
    busy.current = false;
  }, [sections]);

  const loadMore = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setSections((cur) => [...cur, ...source.next(PAGE)]);
  }, [source]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - END_THRESHOLD) {
      loadMore();
    }
  };

  // Tapping a result opens the (static) View Item screen (root route, so back
  // returns here rather than switching tabs).
  const openItem = () => router.push('/item');

  // A labelled placeholder tile; `full` spans both columns (a hero world).
  const Tile = ({ tile, full }: { tile: ResultFeedTile; full?: boolean }) => (
    <Pressable
      onPress={openItem}
      style={[
        full ? styles.hero : styles.tile,
        { height: tile.height, backgroundColor: c.hairline },
      ]}
    >
      <Text style={[styles.tileLabel, { color: c.ink }]}>{tile.label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onBack={() => router.back()}
        onFilter={() => router.push({ pathname: '/search/refine', params: { q: query } })}
        chips={RESULT_CHIPS}
      />

      {/* Infinite masonry — flush per section so a hero world can span the width. */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {sections.map((sec) => (
          <View key={sec.id}>
            <View style={styles.masonry}>
              <View style={styles.column}>
                {sec.left.map((t) => (
                  <Tile key={t.id} tile={t} />
                ))}
              </View>
              <View style={styles.column}>
                {sec.right.map((t) => (
                  <Tile key={t.id} tile={t} />
                ))}
              </View>
            </View>
            {sec.hero ? <Tile tile={sec.hero} full /> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    gap: 12, // uniform vertical rhythm between sections
    paddingHorizontal: space.lg,
    paddingTop: 4,
    paddingBottom: 128, // clear the floating nav
  },
  masonry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  tile: {
    // Fills the column width (default stretch); height is per-world.
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignSelf: 'stretch', // full width — flush with both columns above
    marginTop: 12,
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
