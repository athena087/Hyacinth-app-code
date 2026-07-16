import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

const SLOT = 120; // card width (tap slot / stride)
const GAP = 8;
const STRIDE = SLOT + GAP;
// Weighted-drag feel, mirroring the home reel's vertical pager.
const FOLLOW = 0.82; // content trails the finger (<1 = a dragging lag)
const EDGE_RESIST = 0.3; // overscroll damping past the first / last card
const TRIGGER = 0.24; // fraction of a card the drag must pass to change page
const FLING = 0.45; // release velocity (px/ms) that flips a page regardless
const EASE_MS = 460; // slow settle
const EASING = Easing.bezier(0.22, 0.61, 0.36, 1);

/**
 * An index-based, centered carousel (per the design — no free scroll). Tapping
 * a card or a dot animates that option to the center; the centered card scales
 * up to full size + soul name pill, neighbours shrink and fade. Position/scale/
 * opacity run on the native driver; the pill color switches on selection.
 */
export function RefineCarousel({
  title,
  options,
  initialIndex,
  committedIndices,
  onSelect,
}: {
  title: string;
  options: string[];
  initialIndex: number;
  /** Which options are committed as refinements (highlighted). */
  committedIndices: number[];
  /** Fired when a card/dot is tapped — toggles that option as a refinement. */
  onSelect?: (index: number) => void;
}) {
  const c = useTokens();
  const { width } = useWindowDimensions();
  const centerOffset = (width - SLOT) / 2;

  const [active, setActive] = useState(initialIndex);
  const pos = useRef(new Animated.Value(initialIndex)).current;

  // Latest values for the (stable) PanResponder closures.
  const activeRef = useRef(active);
  activeRef.current = active;
  const lenRef = useRef(options.length);
  lenRef.current = options.length;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // Settle to an index with the slow bezier ease (the home-reel drag feel).
  const settle = (i: number) => {
    setActive(i);
    Animated.timing(pos, {
      toValue: i,
      duration: EASE_MS,
      easing: EASING,
      useNativeDriver: true,
    }).start();
  };
  // A tap commits the tapped option as a refinement.
  const select = (i: number) => {
    settle(i);
    onSelect?.(i);
  };

  // Horizontal swipe browses between cards WITHOUT committing (a tap commits).
  // Weighted follow + edge resistance while dragging; a one-card snap on release
  // decided by distance-then-velocity, so a small right nudge can't flip a page.
  const dragStart = useRef(active);
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
      // Once we own a horizontal drag, never hand it back to the parent
      // ScrollView mid-gesture — that hand-off is what causes the stutter.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        pos.stopAnimation();
        dragStart.current = activeRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const last = lenRef.current - 1;
        let next = dragStart.current - (g.dx * FOLLOW) / STRIDE; // forward = +
        if (next < 0) next *= EDGE_RESIST;
        else if (next > last) next = last + (next - last) * EDGE_RESIST;
        pos.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        const passed = Math.abs(g.dx) > TRIGGER * STRIDE;
        const flung = Math.abs(g.vx) > FLING;
        // Direction from displacement first, else from a fling; dx<0 = forward.
        let step = 0;
        if (passed) step = g.dx < 0 ? 1 : -1;
        else if (flung) step = g.vx < 0 ? 1 : -1;
        settle(clamp(dragStart.current + step, 0, lenRef.current - 1));
      },
    }),
  ).current;

  const translateX = Animated.subtract(centerOffset, Animated.multiply(pos, STRIDE));

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.ink }]}>{title}</Text>

      <View style={styles.viewport} {...pan.panHandlers}>
        <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
          {options.map((name, i) => {
            const distance = Animated.subtract(pos, i);
            const scale = distance.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0.8, 1, 0.8],
              extrapolate: 'clamp',
            });
            const opacity = distance.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0.42, 1, 0.42],
              extrapolate: 'clamp',
            });
            // The pill matches the (overlapping) image width, so only the
            // centred pill may show — neighbours fade out fast to avoid collision.
            const pillOpacity = distance.interpolate({
              inputRange: [-0.5, 0, 0.5],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            const on = committedIndices.includes(i);

            return (
              <Pressable key={name} onPress={() => select(i)} style={styles.card}>
                <Animated.View style={{ alignItems: 'center', gap: 10, opacity, transform: [{ scale }] }}>
                  <View style={[styles.cardImage, { backgroundColor: c.hairline }]}>
                    <Text style={[styles.cardImageLabel, { color: c.ink }]}>{name}</Text>
                  </View>
                  <Animated.View style={{ opacity: pillOpacity }}>
                    <View
                      style={[
                        styles.namePill,
                        on
                          ? { backgroundColor: c.soul, borderColor: c.soul }
                          : { backgroundColor: c.surface, borderColor: c.hairline },
                      ]}
                    >
                      <Text
                        style={[styles.nameText, { color: on ? c.onSoul : c.ink, opacity: on ? 1 : 0.55 }]}
                      >
                        {name}
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      <View style={styles.dots}>
        {options.map((name, i) => (
          <Pressable
            key={name}
            onPress={() => settle(i)} // dots browse only — they don't commit
            hitSlop={6}
            style={[
              styles.dot,
              { width: i === active ? 18 : 7, backgroundColor: i === active ? c.ink : c.hairline },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: space.xl,
    paddingBottom: 6,
  },
  title: {
    paddingHorizontal: space.lg,
    paddingBottom: 10,
    fontFamily: font.semibold,
    fontSize: 15,
    letterSpacing: 0.03 * 15,
  },
  viewport: {
    height: 290,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  card: {
    width: SLOT,
    alignItems: 'center',
  },
  cardImage: {
    // Wider than the 120px card slot so neighbouring images overlap (per
    // request). Stride/tap-slots stay at 120; only the image box grows.
    width: 172,
    height: 226,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardImageLabel: {
    fontFamily: font.regular,
    fontSize: 12,
    opacity: 0.55,
    textAlign: 'center',
  },
  namePill: {
    width: 172, // match the image width above (styles.cardImage)
    height: 30,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: font.medium,
    fontSize: 12,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    paddingTop: 12,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
});
