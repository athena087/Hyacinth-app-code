import { Stack, Tag, X } from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import type { BagItem } from './bagData';

/**
 * One bag entry. A "Look" (bundle) shows a horizontal strip of piece
 * thumbnails; an "Item" shows a single full-width hero. A frosted round Remove
 * button floats top-right. Images are placeholders for now.
 */
export function BagCard({
  item,
  onRemove,
  onPress,
}: {
  item: BagItem;
  onRemove: () => void;
  onPress?: () => void;
}) {
  const c = useTokens();
  const KindIcon = item.bundle ? Stack : Tag;

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      <Pressable
        onPress={onRemove}
        hitSlop={6}
        style={[styles.remove, { backgroundColor: c.glass }]}
      >
        <X size={15} color={c.ink} />
      </Pressable>

      {item.bundle ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {item.images.map((label, i) => (
            <View key={`${label}-${i}`} style={[styles.thumb, { backgroundColor: c.field }]} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.hero, { backgroundColor: c.field }]} />
      )}

      <View style={styles.info}>
        <View style={styles.infoText}>
          <View style={styles.kindRow}>
            <KindIcon size={14} color={c.ink} style={{ opacity: 0.55 }} />
            <Text style={[styles.kind, { color: c.ink }]}>{item.kind.toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: c.ink }]} numberOfLines={1}>
            {item.meta}
          </Text>
        </View>
        <Text style={[styles.price, { color: c.ink }]}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  remove: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  strip: {
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  thumb: {
    width: 148,
    height: 150,
    borderRadius: 12,
  },
  hero: {
    width: '100%',
    height: 176,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    paddingTop: 13,
    paddingBottom: 15,
    paddingHorizontal: space.lg,
  },
  infoText: {
    flex: 1,
    minWidth: 0,
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  kind: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 0.06 * 12,
    opacity: 0.55,
  },
  name: {
    marginTop: 5,
    fontFamily: font.semibold,
    fontSize: 17,
    letterSpacing: -0.01 * 17,
  },
  meta: {
    marginTop: 2,
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.55,
  },
  price: {
    fontFamily: font.semibold,
    fontSize: 18,
  },
});
