import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Interpretation, resolveQuery } from '../search/resolveQuery';
import {
  createResultsFeed,
  ResultFeedTile,
  ResultSection,
} from './resultsFeedSource';

const INITIAL = 4;
const PAGE = 3;
const END_THRESHOLD = 600; // px from the bottom that triggers the next append
// Dark, semi-opaque label reads on every (light-to-mid) palette tint, in either
// theme — the tiles are always the palette colour, not the app background.
const TILE_LABEL = 'rgba(38,32,26,0.62)';

/**
 * The infinite masonry for one resolved search. Split out and keyed by the
 * search (see ResultsScreen) so it rebuilds cleanly when the query/refinement
 * changes — even when that change is a same-route param update (which does not
 * remount the parent).
 */
function ResultsFeed({ interp, onOpen }: { interp: Interpretation; onOpen: () => void }) {
  const source = useRef(
    createResultsFeed({
      settings: interp.family.settings,
      lights: interp.family.lights,
      colors: interp.palette.colors,
      hero: interp.heroWorld ? { label: interp.heroWorld.heroLabel } : undefined,
    }),
  ).current;
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

  // A labelled placeholder tile; `full` spans both columns (a hero world).
  const Tile = ({ tile, full }: { tile: ResultFeedTile; full?: boolean }) => (
    <Pressable
      onPress={onOpen}
      style={[
        full ? styles.hero : styles.tile,
        { height: tile.height, backgroundColor: tile.color },
      ]}
    >
      <Text style={styles.tileLabel}>{tile.label}</Text>
    </Pressable>
  );

  return (
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
  );
}

export default function ResultsScreen() {
  const c = useTokens();
  const router = useRouter();
  const { q, theme, palette } = useLocalSearchParams<{
    q?: string;
    theme?: string;
    palette?: string;
  }>();
  const queryText = typeof q === 'string' ? q : '';
  // Seed the editable search field from the query param; user can alter it here.
  const [query, setQuery] = useState(queryText);

  // Resolve the search from the query + any refinement facets.
  const interp = useMemo(
    () => resolveQuery(queryText, { theme, palette }),
    [queryText, theme, palette],
  );
  // Rebuild the feed whenever the resolved search changes.
  const searchKey = `${queryText}|${theme ?? ''}|${palette ?? ''}`;

  // Editing the query and submitting re-runs the search (fresh results).
  const rerun = (text: string) => {
    const next = text.trim();
    if (next) router.replace({ pathname: '/search/results', params: { q: next } });
  };

  // Tapping a result opens the (static) View Item screen (root route, so back
  // returns here rather than switching tabs).
  const openItem = () => router.push('/item');

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onSubmit={rerun}
        onBack={() => router.back()}
        onFilter={() =>
          router.push({
            pathname: '/search/refine',
            params: { q: query, theme: interp.family.id, palette: interp.palette.id },
          })
        }
        chips={interp.chips}
      />

      <ResultsFeed key={searchKey} interp={interp} onOpen={openItem} />
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
    padding: 12,
  },
  hero: {
    alignSelf: 'stretch', // full width — flush with both columns above
    marginTop: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  tileLabel: {
    fontFamily: font.regular,
    fontSize: 13,
    color: TILE_LABEL,
    textAlign: 'center',
  },
});
