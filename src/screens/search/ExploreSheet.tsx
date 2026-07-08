import {
  Animated,
  GestureResponderHandlers,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { EXPLORE_TILES } from './searchData';

const COLLAPSED_HEIGHT = 150;

/**
 * The Explore / trending bottom sheet. Height and grid opacity are driven by
 * `progress` (0 = collapsed, 1 = open). The grab handle carries the pan
 * handlers (swipe up/down + tap-toggle, all resolved in the parent's
 * PanResponder). When collapsed the body ignores touches so it can't intercept
 * the invisible grid.
 */
export function ExploreSheet({
  progress,
  panHandlers,
  open,
  label = 'Explore',
}: {
  progress: Animated.Value;
  panHandlers: GestureResponderHandlers;
  open: boolean;
  label?: string;
}) {
  const c = useTokens();
  const { height: screenH } = useWindowDimensions();
  const expanded = Math.round(screenH * 0.84);

  const height = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, expanded],
  });
  // Grid fades in only in the second half of the open gesture.
  const gridOpacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={[styles.sheet, { height, backgroundColor: c.canvas }]}>
      <View {...panHandlers} style={styles.handleRow}>
        <View style={[styles.handle, { backgroundColor: c.handle }]} />
      </View>

      <Animated.View style={[styles.body, { opacity: gridOpacity }]} pointerEvents={open ? 'auto' : 'none'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.ink }]}>{label}</Text>
            <Text style={[styles.trending, { color: c.ink }]}>Trending now</Text>
          </View>
          <View style={styles.grid}>
            {EXPLORE_TILES.map((tileLabel) => (
              <View key={tileLabel} style={[styles.tile, { backgroundColor: c.hairline }]}>
                <Text style={[styles.tileLabel, { color: c.ink }]}>{tileLabel}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 16,
  },
  handleRow: {
    paddingTop: space.md,
    paddingBottom: space.sm,
    alignItems: 'center',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
  },
  scrollContent: {
    paddingBottom: 116, // clear the floating nav
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 6,
    paddingBottom: 14,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: 18,
  },
  trending: {
    fontFamily: font.regular,
    fontSize: 12,
    opacity: 0.55,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    // Two columns; the space-between remainder forms the column gutter.
    width: '48.5%',
    height: 150,
    marginBottom: 12,
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
