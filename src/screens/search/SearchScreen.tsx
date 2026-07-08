import { useRouter } from 'expo-router';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { ExploreSheet } from './ExploreSheet';
import { RecentSearchOverlay } from './RecentSearchOverlay';
import { INITIAL_RECENTS, SEARCH_PLACEHOLDER } from './searchData';

export default function SearchScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [recents, setRecents] = useState(INITIAL_RECENTS);

  // 0 = collapsed sheet, 1 = open. Drives sheet height, scrim + grid opacity.
  const progress = useRef(new Animated.Value(0)).current;
  // Latest `open` for use inside the (stable) PanResponder callbacks.
  const openRef = useRef(open);
  openRef.current = open;

  const animateSheet = (toOpen: boolean) => {
    setOpen(toOpen);
    Animated.timing(progress, {
      toValue: toOpen ? 1 : 0,
      duration: 440,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      useNativeDriver: false, // animating height
    }).start();
  };
  // Stable ref so PanResponder (created once) always calls the latest closure.
  const animateRef = useRef(animateSheet);
  animateRef.current = animateSheet;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -24) animateRef.current(true);
        else if (g.dy > 24) animateRef.current(false);
        else animateRef.current(!openRef.current); // tap toggles
      },
    }),
  ).current;

  const scrimOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const openSearch = () => {
    animateSheet(false);
    setSearching(true);
  };

  // Run a query: close the overlay and push the results screen within this tab.
  const runQuery = (query: string) => {
    setSearching(false);
    router.push({ pathname: '/search/results', params: { q: query } });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 96 }]}>
        <Text style={[styles.title, { color: c.ink }]}>What will it be today?</Text>
        <Pressable
          onPress={openSearch}
          style={[styles.field, { backgroundColor: c.field }]}
        >
          <MagnifyingGlass size={21} color={c.ink} style={{ opacity: 0.55 }} />
          <Text style={[styles.fieldText, { color: c.ink }]} numberOfLines={1}>
            {SEARCH_PLACEHOLDER}
          </Text>
        </Pressable>
      </View>

      {/* Scrim behind the sheet */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.scrim, { opacity: scrimOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => animateSheet(false)} />
      </Animated.View>

      <ExploreSheet progress={progress} panHandlers={pan.panHandlers} open={open} />

      <RecentSearchOverlay
        visible={searching}
        recents={recents}
        onCancel={() => setSearching(false)}
        onSubmit={runQuery}
        onRemoveRecent={(i) => setRecents((r) => r.filter((_, j) => j !== i))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontFamily: font.medium,
    fontSize: 40,
    lineHeight: 40 * 1.12,
    letterSpacing: -0.01 * 40,
    textAlign: 'center',
    maxWidth: 300,
  },
  field: {
    marginTop: 30,
    width: '100%',
    maxWidth: 300,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  fieldText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
    opacity: 0.55,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
});
