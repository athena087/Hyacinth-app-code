import { ReactNode, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleProp, ViewStyle } from 'react-native';

const TRIGGER = 60; // leftward px past which the swipe fires
const CLAMP = 120; // max the card follows the finger

/**
 * Wraps content in a leftward-swipe gesture. Dragging past TRIGGER fires
 * onSwipe; the gesture only engages for dominantly-horizontal leftward motion,
 * so it coexists with a vertical scroll parent without stealing scrolls.
 *
 * By default the card follows the finger to the left (clamped) and springs
 * back on release. Pass `move={false}` to keep the content still while the
 * swipe is detected — the gesture fires without any visual drag.
 */
export function SwipeLeft({
  onSwipe,
  style,
  children,
  move = true,
}: {
  onSwipe: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  move?: boolean;
}) {
  const tx = useRef(new Animated.Value(0)).current;
  // Latest-callback ref so the memoized PanResponder never fires a stale onSwipe.
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          g.dx < 0 && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 8,
        onPanResponderMove: (_e, g) => {
          if (move && g.dx < 0) tx.setValue(Math.max(g.dx, -CLAMP));
        },
        onPanResponderRelease: (_e, g) => {
          const fire = g.dx < -TRIGGER;
          if (move) Animated.spring(tx, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
          if (fire) onSwipeRef.current();
        },
        onPanResponderTerminate: () => {
          if (move) Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [tx, move],
  );

  return (
    <Animated.View style={[style, { transform: [{ translateX: tx }] }]} {...pan.panHandlers}>
      {children}
    </Animated.View>
  );
}
