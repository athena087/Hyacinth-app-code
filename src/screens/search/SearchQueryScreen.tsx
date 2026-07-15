import { useFocusEffect, useRouter } from 'expo-router';
import { CaretLeft, ClockCounterClockwise, MagnifyingGlass, X } from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { font, radius, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * The recent/type search screen. A pushed route (not a Modal) so it stays in
 * the stack: submitting the field or tapping a recent pushes results straight
 * on top (no flash back to the hero), and back from results returns here.
 */
export default function SearchQueryScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [text, setText] = useState('');
  // Device-local recent history — starts blank, records each executed search.
  const { recents, add, remove, clear } = useRecentSearches();
  const inputRef = useRef<TextInput>(null);

  // Focus once the screen settles (autoFocus is unreliable mid-push animation),
  // and re-focus whenever we return to this screen from results.
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }, []),
  );

  const run = (query: string) => {
    const q = query.trim();
    if (!q) return;
    add(q); // record before navigating (typed submit or a tapped recent)
    router.push({ pathname: '/search/results', params: { q } });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.md }]}>
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <CaretLeft size={26} color={c.ink} />
        </Pressable>
        <View style={[styles.field, { backgroundColor: c.surface, borderColor: c.ink }]}>
          <MagnifyingGlass size={20} color={c.ink} style={{ opacity: 0.55 }} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => run(text)}
            style={[styles.input, { color: c.ink }]}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}
      >
        {recents.length > 0 ? (
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: c.ink }]}>RECENT</Text>
            <Pressable onPress={clear} hitSlop={8}>
              <Text style={[styles.clear, { color: c.ink }]}>Clear</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.emptyHint, { color: c.ink }]}>
            Your recent searches will appear here.
          </Text>
        )}
        {recents.map((recent) => (
          <Pressable key={recent} onPress={() => run(recent)} style={styles.recentRow}>
            <ClockCounterClockwise size={20} color={c.ink} style={{ opacity: 0.55 }} />
            <Text style={[styles.recentText, { color: c.ink }]} numberOfLines={1}>
              {recent}
            </Text>
            <Pressable onPress={() => remove(recent)} hitSlop={8} style={styles.remove}>
              <X size={16} color={c.ink} style={{ opacity: 0.55 }} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingLeft: space.sm,
    paddingRight: space.lg,
    paddingBottom: space.md,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: radius.control,
  },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
    padding: 0,
  },
  list: {
    flex: 1,
    paddingHorizontal: space.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 0.1 * 12,
    opacity: 0.55,
  },
  clear: {
    fontFamily: font.regular,
    fontSize: 13,
    opacity: 0.55,
  },
  emptyHint: {
    fontFamily: font.regular,
    fontSize: 14,
    opacity: 0.4,
    textAlign: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card - 2,
  },
  recentText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
  },
  remove: {
    padding: 4,
  },
});
