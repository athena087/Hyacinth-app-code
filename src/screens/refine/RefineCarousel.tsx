import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

const SLOT = 104; // card width
const GAP = 8;
const STRIDE = SLOT + GAP;

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
}: {
  title: string;
  options: string[];
  initialIndex: number;
}) {
  const c = useTokens();
  const { width } = useWindowDimensions();
  const centerOffset = (width - SLOT) / 2;

  const [active, setActive] = useState(initialIndex);
  const pos = useRef(new Animated.Value(initialIndex)).current;

  const select = (i: number) => {
    setActive(i);
    Animated.timing(pos, {
      toValue: i,
      duration: 420,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      useNativeDriver: true,
    }).start();
  };

  const translateX = Animated.subtract(centerOffset, Animated.multiply(pos, STRIDE));

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.ink }]}>{title}</Text>

      <View style={styles.viewport}>
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
            const on = i === active;

            return (
              <Pressable key={name} onPress={() => select(i)} style={styles.card}>
                <Animated.View style={{ alignItems: 'center', gap: 10, opacity, transform: [{ scale }] }}>
                  <View style={[styles.cardImage, { backgroundColor: c.hairline }]}>
                    <Text style={[styles.cardImageLabel, { color: c.ink }]}>{name}</Text>
                  </View>
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
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      <View style={styles.dots}>
        {options.map((name, i) => (
          <Pressable
            key={name}
            onPress={() => select(i)}
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
    height: 250,
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
    // Wider than the 104px card slot so neighbouring images overlap (per
    // request). Stride/tap-slots stay at 104; only the image box grows.
    width: 150,
    height: 196,
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
    width: 92,
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
