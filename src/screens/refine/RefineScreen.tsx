import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SearchChrome } from '../../components/SearchChrome';
import { RESULT_CHIPS } from '../results/resultsData';
import { useTokens } from '../../theme/useTokens';
import { RefineCarousel } from './RefineCarousel';
import {
  PALETTE_INITIAL,
  PALETTE_OPTIONS,
  THEME_INITIAL,
  THEME_OPTIONS,
} from './refineData';

export default function RefineScreen() {
  const c = useTokens();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');

  // Enter re-runs the search: replace refine with a fresh results for the query.
  const runQuery = (text: string) => {
    const next = text.trim();
    if (next) router.replace({ pathname: '/search/results', params: { q: next } });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onSubmit={runQuery}
        onBack={() => router.back()}
        chips={RESULT_CHIPS}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <RefineCarousel title="THEME" options={THEME_OPTIONS} initialIndex={THEME_INITIAL} />
        <RefineCarousel title="PALETTE" options={PALETTE_OPTIONS} initialIndex={PALETTE_INITIAL} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 128 }, // clear the floating nav
});
