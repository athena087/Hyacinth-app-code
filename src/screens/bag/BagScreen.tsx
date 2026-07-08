import { useRouter } from 'expo-router';
import { ArrowRight, ShoppingBag } from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../cart/CartContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { BagCard } from './BagCard';
import { formatPrice } from './bagData';

export default function BagScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { items, total, count, remove } = useCart();
  const hasCards = count > 0;
  const countLabel = count === 1 ? '1 item' : `${count} items`;

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + space.xl }]}>
          <Text style={[styles.heading, { color: c.ink }]}>SHOPPING BAG</Text>
        </View>

        {hasCards ? (
          <View style={styles.list}>
            {items.map((item) => (
              <BagCard key={item.id} item={item} onRemove={() => remove(item.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <ShoppingBag size={44} color={c.ink} style={{ opacity: 0.55 }} />
            <Text style={[styles.emptyTitle, { color: c.ink }]}>Your bag is empty</Text>
            <Text style={[styles.emptyBody, { color: c.ink }]}>
              Looks and pieces you add will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout summary — fixed below the line; the floating nav sits over it. */}
      <View
        style={[
          styles.summary,
          { backgroundColor: c.bg, paddingBottom: insets.bottom + 96 },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: c.ink }]}>TOTAL · {countLabel}</Text>
          <Text style={[styles.totalValue, { color: c.ink }]}>{formatPrice(total)}</Text>
        </View>
        <Pressable
          disabled={!hasCards}
          onPress={() => router.push('/checkout')}
          style={[styles.checkout, { backgroundColor: c.soul, opacity: hasCards ? 1 : 0.4 }]}
        >
          <Text style={[styles.checkoutText, { color: c.onSoul }]}>Checkout</Text>
          <ArrowRight size={18} weight="bold" color={c.onSoul} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.lg + space.xs, // 20
    paddingBottom: 6,
  },
  heading: {
    fontFamily: font.semibold,
    fontSize: 24,
    letterSpacing: 0.02 * 24,
  },
  list: {
    paddingHorizontal: space.lg + space.xs,
    paddingVertical: space.lg,
    gap: space.lg,
  },
  empty: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: space.md,
  },
  emptyTitle: {
    fontFamily: font.semibold,
    fontSize: 17,
  },
  emptyBody: {
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.55,
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 0.18,
    borderTopColor: '#2E2E2E',
    paddingHorizontal: space.lg + space.xs,
    paddingTop: space.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  totalLabel: {
    fontFamily: font.semibold,
    fontSize: 13,
    letterSpacing: 0.07 * 13,
    opacity: 0.55,
  },
  totalValue: {
    fontFamily: font.semibold,
    fontSize: 25,
    letterSpacing: -0.01 * 25,
  },
  checkout: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  checkoutText: {
    fontFamily: font.semibold,
    fontSize: 16,
  },
});
