import { StyleSheet, Text, View } from 'react-native';
import { font, radius, space, textOpacity } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import type { World } from './worlds';

/**
 * A single world in the feed: a full-bleed hero (currently a labeled
 * placeholder) followed by a caption row. Heroes break to full-bleed and are
 * never carded/bordered — space alone separates them.
 */
export function WorldCard({ world }: { world: World }) {
  const c = useTokens();

  return (
    <View>
      <View style={[styles.hero, { backgroundColor: c.hairline }]}>
        <Text
          style={[styles.heroLabel, { color: c.ink, opacity: textOpacity.secondary }]}
          numberOfLines={2}
        >
          {world.heroLabel}
        </Text>
      </View>
      <View style={[styles.caption, { backgroundColor: c.surface }]}>
        <Text style={[styles.captionText, { color: c.ink, opacity: textOpacity.secondary }]}>
          {world.pieces} pieces · composed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    // Mock frame: 520px tall in a 430px-wide device ≈ 1.21:1. Expressed as a
    // ratio so it scales across widths instead of a fixed pixel height.
    aspectRatio: 430 / 520,
    borderRadius: radius.photo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  heroLabel: {
    fontFamily: font.regular,
    fontSize: 15,
    textAlign: 'center',
  },
  caption: {
    paddingTop: space.xs + 2,
    paddingBottom: space.xl - 2,
    paddingHorizontal: space.lg,
  },
  captionText: {
    fontFamily: font.regular,
    fontSize: 13,
  },
});
