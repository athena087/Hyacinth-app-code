import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { WorldPage } from './WorldPage';
import type { World } from './worlds';

const FOLLOW = 0.85; // content follows 85% of the finger — a touch of lag/weight
const EDGE_RESIST = 0.3; // rubber-band factor past the first/last world
const TRIGGER = 0.2; // fraction of a screen you must drag to advance
const FLING = 0.4; // velocity (px/ms) that advances regardless of distance
const EASE_MS = 520; // slow, deliberate settle into the next world
const EASING = Easing.bezier(0.22, 0.61, 0.36, 1);

/**
 * A vertical, one-world-per-screen pager with a weighted drag: the world
 * follows the finger with slight resistance, then eases slowly into the next on
 * release. Only a small window of pages is mounted (endless-friendly). The
 * gesture layer is static; an inner Animated layer is what translates.
 */
export function WorldReel({
  data,
  onEndReached,
  onOpen,
  header,
}: {
  data: World[];
  onEndReached: () => void;
  onOpen: (label: string) => void;
  header?: ReactNode;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const ty = useRef(new Animated.Value(0)).current;

  // Latest data length / callback for the memoized PanResponder to read.
  const lenRef = useRef(data.length);
  lenRef.current = data.length;
  const endRef = useRef(onEndReached);
  endRef.current = onEndReached;

  const settle = useCallback(
    (target: number) => {
      indexRef.current = target;
      setIndex(target);
      Animated.timing(ty, {
        toValue: -target * H,
        duration: EASE_MS,
        easing: EASING,
        useNativeDriver: true,
      }).start();
      // Keep a buffer of upcoming worlds loaded.
      if (target >= lenRef.current - 2) endRef.current();
    },
    [ty, H],
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 8,
        onPanResponderGrant: () => ty.stopAnimation(),
        onPanResponderMove: (_e, g) => {
          const i = indexRef.current;
          const last = lenRef.current - 1;
          // Rubber-band when dragging past the first/last world.
          const atEdge = (i === 0 && g.dy > 0) || (i === last && g.dy < 0);
          const dy = g.dy * (atEdge ? EDGE_RESIST : FOLLOW);
          ty.setValue(-i * H + dy);
        },
        onPanResponderRelease: (_e, g) => {
          const i = indexRef.current;
          const last = lenRef.current - 1;
          const up = -g.dy > H * TRIGGER || g.vy < -FLING; // to the next world
          const down = g.dy > H * TRIGGER || g.vy > FLING; // back to the previous
          let target = i;
          if (up && i < last) target = i + 1;
          else if (down && i > 0) target = i - 1;
          settle(target);
        },
        onPanResponderTerminate: () => settle(indexRef.current),
      }),
    [H, settle, ty],
  );

  // Only mount a small window around the current world.
  const windowIdx: number[] = [];
  for (let i = Math.max(0, index - 1); i <= Math.min(data.length - 1, index + 2); i++) {
    windowIdx.push(i);
  }

  // The greeting header shows on the first world and fades as you move off it.
  const headerOpacity = ty.interpolate({
    inputRange: [-H, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
        <Animated.View style={[styles.track, { transform: [{ translateY: ty }] }]}>
          {windowIdx.map((i) => (
            <View key={data[i].id} style={{ position: 'absolute', top: i * H, left: 0, right: 0, height: H }}>
              <WorldPage world={data[i]} height={H} onOpen={onOpen} />
            </View>
          ))}
        </Animated.View>
      </View>

      {header ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.header, { opacity: headerOpacity, paddingTop: insets.top + space.xl }]}
        >
          {header}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  track: { position: 'absolute', top: 0, left: 0, right: 0, height: 0 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
});
