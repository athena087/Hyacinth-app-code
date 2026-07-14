import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { font } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { createExploreFeed, ExploreSection, ExploreTile } from './exploreFeedSource';

const INITIAL = 4;
const PAGE = 3;
const END_THRESHOLD = 600; // px from the bottom that triggers the next append

/** A labelled placeholder tile; `full` spans both columns (a hero world). */
function Tile({ tile, full }: { tile: ExploreTile; full?: boolean }) {
  const c = useTokens();
  return (
    <View
      style={[
        full ? styles.hero : styles.tile,
        { height: tile.height, backgroundColor: c.hairline },
      ]}
    >
      <Text style={[styles.tileLabel, { color: c.ink }]}>{tile.label}</Text>
    </View>
  );
}

/**
 * The infinite explore feed: a staggered two-column masonry whose columns end
 * flush per section (so a full-width hero world can sit between sections with
 * the worlds above ending and the worlds below starting level). Owns its scroll
 * and appends more sections as you near the bottom.
 */
export function ExploreFeed({ label }: { label: string }) {
  const c = useTokens();
  const source = useRef(createExploreFeed()).current;
  const [sections, setSections] = useState<ExploreSection[]>(() => source.next(INITIAL));

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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      scrollEventThrottle={16}
      onScroll={onScroll}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.ink }]}>{label}</Text>
        <Text style={[styles.trending, { color: c.ink }]}>Trending now</Text>
      </View>

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

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12, // uniform vertical rhythm between sections (and header)
    paddingBottom: 116, // clear the floating nav
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 6,
  },
  title: { fontFamily: font.semibold, fontSize: 18 },
  trending: { fontFamily: font.regular, fontSize: 12, opacity: 0.55 },
  masonry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  column: { flex: 1, minWidth: 0, gap: 12 },
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
  tileLabel: { fontFamily: font.regular, fontSize: 13, opacity: 0.55 },
});
