import {
  Animated,
  GestureResponderHandlers,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { ExploreFeed } from './ExploreFeed';

const COLLAPSED_HEIGHT = 150;

/**
 * The Explore / trending bottom sheet. Height is driven by `progress`
 * (0 = collapsed, 1 = open); the feed stays visible so it peeks out of the
 * collapsed sheet. The grab handle carries the pan handlers (swipe up/down +
 * tap-toggle, resolved in the parent's PanResponder). When collapsed the body
 * ignores touches so the peek can't intercept the flick-to-open.
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
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  // Open all the way up to just below the Dynamic Island / status bar.
  const expanded = screenH - insets.top;

  const height = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, expanded],
  });

  return (
    <Animated.View style={[styles.sheet, { height, backgroundColor: c.canvas }]}>
      <View {...panHandlers} style={styles.handleRow}>
        <View style={[styles.handle, { backgroundColor: c.handle }]} />
      </View>

      {/* Feed stays visible so it peeks out when collapsed; only interactive when open. */}
      <View style={styles.body} pointerEvents={open ? 'auto' : 'none'}>
        <ExploreFeed label={label} />
      </View>
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
});
