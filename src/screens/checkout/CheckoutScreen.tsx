import { useRouter } from 'expo-router';
import {
  AppleLogo,
  CaretLeft,
  CaretRight,
  Check,
  CreditCard,
  LockSimple,
} from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../cart/CartContext';
import { formatPrice } from '../bag/bagData';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { CheckoutInput } from './CheckoutInput';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function CheckoutScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, count, looks, pieces } = useCart();

  const [paid, setPaid] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pay = () => {
    if (timer.current) clearTimeout(timer.current);
    setPaid(true);
    timer.current = setTimeout(() => setPaid(false), 1600);
  };

  const countLabel = count === 1 ? '1 item' : `${count} items`;

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 52 }]}>
          <Text style={[styles.heading, { color: c.ink }]}>CHECKOUT</Text>
        </View>

        <View style={styles.body}>
          {/* Order */}
          <View style={styles.section}>
            <Text style={[styles.eyebrow, { color: c.ink }]}>ORDER</Text>
            <View style={[styles.orderCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
              <View style={styles.thumbs}>
                {items.slice(0, 3).map((it) => (
                  <View key={it.id} style={[styles.thumb, { backgroundColor: c.field }]} />
                ))}
              </View>
              <View style={styles.orderInfo}>
                <Text style={[styles.orderCount, { color: c.ink }]}>{countLabel}</Text>
                <Text style={[styles.orderMeta, { color: c.ink }]} numberOfLines={1}>
                  {plural(looks, 'look', 'looks')} · {plural(pieces, 'piece', 'pieces')}
                </Text>
              </View>
              <Text style={[styles.orderPrice, { color: c.ink }]}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* Delivery */}
          <View style={styles.section}>
            <Text style={[styles.eyebrow, { color: c.ink }]}>DELIVERY</Text>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.hairline }]}>
              <Pressable style={styles.deliveryRow}>
                <View style={styles.flex}>
                  <Text style={[styles.deliveryName, { color: c.ink }]}>Amelia Hart</Text>
                  <Text style={[styles.deliveryAddr, { color: c.ink }]}>
                    14 Fern Grove, London N16 8QT
                  </Text>
                </View>
                <CaretRight size={16} color={c.ink} style={{ opacity: 0.55 }} />
              </Pressable>
              <View style={[styles.divider, { backgroundColor: c.hairline }]} />
              <View style={styles.shippingRow}>
                <Text style={[styles.shippingText, { color: c.ink }]}>
                  Standard · arrives 12–16 Jan
                </Text>
                <Text style={[styles.shippingFree, { color: c.ink }]}>Free</Text>
              </View>
            </View>
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={[styles.eyebrow, { color: c.ink }]}>PAYMENT</Text>

            <Pressable style={[styles.applePay, { backgroundColor: c.ink }]}>
              <AppleLogo size={19} weight="fill" color={c.bg} />
              <Text style={[styles.applePayText, { color: c.bg }]}>Pay</Text>
            </Pressable>

            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: c.hairline }]} />
              <Text style={[styles.orText, { color: c.ink }]}>or pay by card</Text>
              <View style={[styles.orLine, { backgroundColor: c.hairline }]} />
            </View>

            <View style={styles.fields}>
              <View>
                <CheckoutInput
                  placeholder="Card number"
                  inputMode="numeric"
                  style={styles.cardNumber}
                />
                <CreditCard size={20} color={c.ink} style={styles.cardIcon} />
              </View>
              <View style={styles.fieldRow}>
                <CheckoutInput placeholder="MM / YY" inputMode="numeric" style={styles.flex} />
                <CheckoutInput placeholder="CVC" inputMode="numeric" style={styles.flex} />
              </View>
              <CheckoutInput placeholder="Name on card" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pay footer */}
      <View style={[styles.footer, { backgroundColor: c.bg, borderTopColor: c.ink, paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: c.ink }]}>TOTAL · {countLabel}</Text>
          <Text style={[styles.totalValue, { color: c.ink }]}>{formatPrice(total)}</Text>
        </View>
        <Pressable onPress={pay} style={[styles.payBtn, { backgroundColor: c.soul }]}>
          {paid ? (
            <Check size={18} weight="bold" color={c.onSoul} />
          ) : (
            <LockSimple size={18} color={c.onSoul} />
          )}
          <Text style={[styles.payText, { color: c.onSoul }]}>
            {paid ? 'Order placed' : `Pay ${formatPrice(total)}`}
          </Text>
        </Pressable>
      </View>

      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={6}
        style={[styles.back, { top: insets.top + space.xs }]}
      >
        <CaretLeft size={26} color={c.ink} />
      </Pressable>
    </View>
  );
}

const PAD = space.lg + space.xs; // 20

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  header: { paddingHorizontal: PAD, paddingBottom: 4 },
  heading: { fontFamily: font.semibold, fontSize: 24, letterSpacing: 0.02 * 24 },
  body: { paddingHorizontal: PAD, paddingTop: space.lg, paddingBottom: 26, gap: 22 },
  section: { gap: 9 },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 0.1 * 12,
    opacity: 0.55,
  },

  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  thumbs: { flexDirection: 'row', gap: 6 },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  orderInfo: { flex: 1, minWidth: 0 },
  orderCount: { fontFamily: font.semibold, fontSize: 14 },
  orderMeta: { marginTop: 1, fontFamily: font.regular, fontSize: 12, opacity: 0.55 },
  orderPrice: { fontFamily: font.semibold, fontSize: 16 },

  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deliveryName: { fontFamily: font.semibold, fontSize: 14 },
  deliveryAddr: { marginTop: 2, fontFamily: font.regular, fontSize: 13, lineHeight: 13 * 1.45, opacity: 0.55 },
  divider: { height: 1 },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shippingText: { fontFamily: font.regular, fontSize: 13, opacity: 0.55 },
  shippingFree: { fontFamily: font.semibold, fontSize: 13 },

  applePay: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  applePayText: { fontFamily: font.semibold, fontSize: 16 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 4 },
  orLine: { flex: 1, height: 1 },
  orText: { fontFamily: font.regular, fontSize: 12, opacity: 0.55 },
  fields: { gap: 10 },
  fieldRow: { flexDirection: 'row', gap: 10 },
  cardNumber: { paddingRight: 48 },
  cardIcon: { position: 'absolute', right: 16, top: 16, opacity: 0.55 },

  footer: {
    borderTopWidth: 0.18,
    paddingHorizontal: PAD,
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  totalLabel: { fontFamily: font.semibold, fontSize: 13, letterSpacing: 0.07 * 13, opacity: 0.55 },
  totalValue: { fontFamily: font.semibold, fontSize: 25, letterSpacing: -0.01 * 25 },
  payBtn: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  payText: { fontFamily: font.semibold, fontSize: 16 },

  back: {
    position: 'absolute',
    left: space.md,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
