import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeLeft } from '../../components/SwipeLeft';
import { font, space, textOpacity } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import type { World } from './worlds';

// Keep the caption clear of the floating bottom nav.
const NAV_CLEARANCE = 88;

/**
 * A single world sized to fill the viewport (one per page in the reel). The
 * hero fills the screen and swipes left to open View Item; the caption floats
 * over the bottom. Height is passed in so every page matches the pager stride.
 */
export function WorldPage({
  world,
  height,
  onOpen,
}: {
  world: World;
  height: number;
  onOpen: (label: string) => void;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height, backgroundColor: c.bg }}>
      <SwipeLeft
        onSwipe={() => onOpen(world.heroLabel)}
        move={false}
        style={[styles.hero, { backgroundColor: c.hairline }]}
      >
        <Text
          style={[styles.heroLabel, { color: c.ink, opacity: textOpacity.secondary }]}
          numberOfLines={2}
        >
          {world.heroLabel}
        </Text>
      </SwipeLeft>

      <View
        pointerEvents="none"
        style={[styles.caption, { paddingBottom: insets.bottom + NAV_CLEARANCE }]}
      >
        <Text style={[styles.captionText, { color: c.ink }]}>
          {world.pieces} pieces · composed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  heroLabel: { fontFamily: font.regular, fontSize: 15, textAlign: 'center' },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
  },
  captionText: { fontFamily: font.regular, fontSize: 14, opacity: textOpacity.secondary },
});
