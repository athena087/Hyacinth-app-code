import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SearchChrome } from '../../components/SearchChrome';
import { useTokens } from '../../theme/useTokens';
import { FAMILIES, PALETTES } from '../search/moodLibrary';
import { resolveQuery } from '../search/resolveQuery';
import { RefineCarousel } from './RefineCarousel';

const THEME_OPTIONS = FAMILIES.map((f) => f.label);
const PALETTE_OPTIONS = PALETTES.map((p) => p.label);

export default function RefineScreen() {
  const c = useTokens();
  const router = useRouter();
  const { q, theme, palette } = useLocalSearchParams<{
    q?: string;
    theme?: string;
    palette?: string;
  }>();
  const queryText = typeof q === 'string' ? q : '';
  const [query, setQuery] = useState(queryText);

  // Open the carousels on whatever the current search resolved to, so refining
  // starts from the active match rather than a fixed default.
  const initial = useMemo(
    () => resolveQuery(queryText, { theme, palette }),
    [queryText, theme, palette],
  );
  const initialTheme = Math.max(0, FAMILIES.findIndex((f) => f.id === initial.family.id));
  const initialPalette = Math.max(0, PALETTES.findIndex((p) => p.id === initial.palette.id));

  const themeIdx = useRef(initialTheme);
  const paletteIdx = useRef(initialPalette);

  // Chips reflect the current selection (updated as the user turns the dials).
  const [chips, setChips] = useState<string[]>([
    FAMILIES[initialTheme].label,
    PALETTES[initialPalette].label,
  ]);
  const syncChips = () =>
    setChips([FAMILIES[themeIdx.current].label, PALETTES[paletteIdx.current].label]);

  // Submitting applies the refinement: re-run results with the chosen facets.
  const apply = (text: string) => {
    const next = text.trim();
    if (!next) return;
    router.replace({
      pathname: '/search/results',
      params: {
        q: next,
        theme: FAMILIES[themeIdx.current].id,
        palette: PALETTES[paletteIdx.current].id,
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onSubmit={apply}
        onBack={() => router.back()}
        chips={chips}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <RefineCarousel
          title="THEME"
          options={THEME_OPTIONS}
          initialIndex={initialTheme}
          onChange={(i) => {
            themeIdx.current = i;
            syncChips();
          }}
        />
        <RefineCarousel
          title="PALETTE"
          options={PALETTE_OPTIONS}
          initialIndex={initialPalette}
          onChange={(i) => {
            paletteIdx.current = i;
            syncChips();
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 128 }, // clear the floating nav
});
