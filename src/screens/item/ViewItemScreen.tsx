import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../theme/useTokens';
import { BreakdownPanel } from './BreakdownPanel';
import { OverviewPanel } from './OverviewPanel';

/**
 * View Item — a two-panel horizontal pager: overview (the look) → breakdown
 * (the individual pieces). A native paging ScrollView drives the live drag and
 * snap; floating overlays (back caret + page dots) sit above it. Back steps
 * from breakdown → overview, then out to the results on the overview panel.
 */
export default function ViewItemScreen() {
  const c = useTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const pagerRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goPage = (n: number) => pagerRef.current?.scrollTo({ x: n * width, animated: true });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const onBack = () => {
    if (page === 1) goPage(0);
    else router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <OverviewPanel width={width} />
        <BreakdownPanel width={width} />
      </ScrollView>

      {/* ── Floating overlays ── */}
      <Pressable onPress={onBack} hitSlop={6} style={[styles.back, { top: insets.top + 8 }]}>
        <CaretLeft size={26} color={c.ink} />
      </Pressable>

      <View style={[styles.dotsPill, { top: insets.top + 14, backgroundColor: c.glass }]}>
        {[0, 1].map((n) => (
          <Pressable
            key={n}
            onPress={() => goPage(n)}
            hitSlop={6}
            style={[
              styles.dot,
              { width: n === page ? 16 : 6, backgroundColor: c.ink, opacity: n === page ? 1 : 0.4 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: {
    position: 'absolute',
    left: 12,
    zIndex: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsPill: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -27 }],
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  dot: { height: 6, borderRadius: 4 },
});
