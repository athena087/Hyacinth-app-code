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
import { Chip, SearchChrome } from '../../components/SearchChrome';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { familyById, paletteById } from '../search/moodLibrary';
import { resolveQuery } from '../search/resolveQuery';
import {
  createResultsFeed,
  ResultFeedTile,
  ResultSection,
  ResultsFeedConfig,
} from './resultsFeedSource';

const INITIAL = 4;
const PAGE = 3;
const END_THRESHOLD = 600; // px from the bottom that triggers the next append
// Dark, semi-opaque label reads on every (light-to-mid) palette tint, in either
// theme — the tiles are always the palette colour, not the app background.
const TILE_LABEL = 'rgba(38,32,26,0.62)';

const parseList = (v: string | string[] | undefined): string[] =>
  typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];

const uniq = (arr: string[]): string[] => Array.from(new Set(arr));

/**
 * The infinite masonry for one resolved search. Split out and keyed by the
 * search (see ResultsScreen) so it rebuilds cleanly when the query/refinement
 * changes — even when that change is a same-route param update (which does not
 * remount the parent).
 */
function ResultsFeed({ config, onOpen }: { config: ResultsFeedConfig; onOpen: () => void }) {
  const source = useRef(createResultsFeed(config)).current;
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

  const themeIds = parseList(theme);
  const paletteIds = parseList(palette);

  // Base interpretation from the query text alone (family/palette/hero).
  const base = resolveQuery(queryText);

  // Refinements (if any) override the base: a feed drawn from the UNION of the
  // selected families' worlds and the selected palettes' colours; a text hero is
  // kept only when no theme refinement is active.
  const families = themeIds.length
    ? (themeIds.map(familyById).filter(Boolean) as NonNullable<ReturnType<typeof familyById>>[])
    : [base.family];
  const palettes = paletteIds.length
    ? (paletteIds.map(paletteById).filter(Boolean) as NonNullable<ReturnType<typeof paletteById>>[])
    : [base.palette];
  const hero = themeIds.length ? undefined : base.heroWorld;

  const config: ResultsFeedConfig = {
    settings: uniq(families.flatMap((f) => f.settings)),
    lights: uniq(families.flatMap((f) => f.lights)),
    colors: uniq(palettes.flatMap((p) => p.colors)),
    hero: hero ? { label: hero.heroLabel } : undefined,
  };
  // Rebuild the feed whenever the resolved search changes.
  const searchKey = `${queryText}|${themeIds.join(',')}|${paletteIds.join(',')}`;

  // Editing the query and submitting re-runs the search (fresh results).
  const rerun = (text: string) => {
    const next = text.trim();
    if (next) router.replace({ pathname: '/search/results', params: { q: next } });
  };

  // One chip per active refinement (empty when none). Its ✕ removes just that
  // one and re-runs with what's left.
  const activeChips: Chip[] = [
    ...themeIds.map((id) => ({ id: `theme:${id}`, label: familyById(id)?.label ?? id })),
    ...paletteIds.map((id) => ({ id: `palette:${id}`, label: paletteById(id)?.label ?? id })),
  ];
  const removeChip = (chipId: string) => {
    const [axis, id] = chipId.split(':');
    const nextThemes = axis === 'theme' ? themeIds.filter((t) => t !== id) : themeIds;
    const nextPalettes = axis === 'palette' ? paletteIds.filter((p) => p !== id) : paletteIds;
    const params: Record<string, string> = { q: queryText };
    if (nextThemes.length) params.theme = nextThemes.join(',');
    if (nextPalettes.length) params.palette = nextPalettes.join(',');
    router.replace({ pathname: '/search/results', params });
  };
  const openRefine = () => {
    const params: Record<string, string> = { q: query };
    if (themeIds.length) params.theme = themeIds.join(',');
    if (paletteIds.length) params.palette = paletteIds.join(',');
    router.replace({ pathname: '/search/refine', params });
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
        onFilter={openRefine}
        chips={activeChips}
        onRemoveChip={removeChip}
      />

      <ResultsFeed key={searchKey} config={config} onOpen={openItem} />
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
