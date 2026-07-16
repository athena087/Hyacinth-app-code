import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, SearchChrome } from '../../components/SearchChrome';
import { useTokens } from '../../theme/useTokens';
import {
  familyById,
  paletteById,
  relevantPalettes,
  relevantThemes,
} from '../search/moodLibrary';
import { resolveQuery } from '../search/resolveQuery';
import { RefineCarousel } from './RefineCarousel';

const parseList = (v: string | string[] | undefined): string[] =>
  typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];

const toggle = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

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

  // Options are tailored to the search's resolved (primary) family.
  const base = useMemo(() => resolveQuery(queryText), [queryText]);
  const themeOptions = useMemo(() => relevantThemes(base.family.id), [base]);
  const paletteOptions = useMemo(() => relevantPalettes(base.family.id), [base]);

  // Active refinements — none unless the search arrived with them. Multiple
  // themes and multiple palettes may be added.
  const [committedThemes, setCommittedThemes] = useState<string[]>(() => parseList(theme));
  const [committedPalettes, setCommittedPalettes] = useState<string[]>(() => parseList(palette));

  // One chip per committed refinement; id encodes its axis for removal.
  const chips: Chip[] = [
    ...committedThemes.map((id) => ({ id: `theme:${id}`, label: familyById(id)?.label ?? id })),
    ...committedPalettes.map((id) => ({ id: `palette:${id}`, label: paletteById(id)?.label ?? id })),
  ];

  const removeChip = (chipId: string) => {
    const [axis, id] = chipId.split(':');
    if (axis === 'theme') setCommittedThemes((cur) => cur.filter((x) => x !== id));
    if (axis === 'palette') setCommittedPalettes((cur) => cur.filter((x) => x !== id));
  };

  const themeCommitted = themeOptions
    .map((f, i) => (committedThemes.includes(f.id) ? i : -1))
    .filter((i) => i >= 0);
  const paletteCommitted = paletteOptions
    .map((p, i) => (committedPalettes.includes(p.id) ? i : -1))
    .filter((i) => i >= 0);

  // Leaving the screen (back or submit) applies the committed refinements.
  const apply = (text: string) => {
    const next = text.trim() || queryText;
    const params: Record<string, string> = { q: next };
    if (committedThemes.length) params.theme = committedThemes.join(',');
    if (committedPalettes.length) params.palette = committedPalettes.join(',');
    router.replace({ pathname: '/search/results', params });
  };

  // Snap the vertical scroll to each carousel's top so a carousel never rests
  // half-scrolled (which would misalign its horizontal swipe). Offsets are
  // measured from layout; decelerationRate keeps the snap smooth, not abrupt.
  const sectionY = useRef<[number, number]>([0, 0]);
  const [snapOffsets, setSnapOffsets] = useState<number[]>([]);
  const onSectionLayout = (i: 0 | 1) => (e: LayoutChangeEvent) => {
    sectionY.current[i] = e.nativeEvent.layout.y;
    setSnapOffsets([sectionY.current[0], sectionY.current[1]].sort((a, b) => a - b));
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <SearchChrome
        query={query}
        editable
        onChangeQuery={setQuery}
        onSubmit={apply}
        onBack={() => apply(query)}
        chips={chips}
        onRemoveChip={removeChip}
        reserveChipSpace
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToOffsets={snapOffsets.length === 2 ? snapOffsets : undefined}
        snapToEnd={false}
        decelerationRate="fast"
      >
        <View onLayout={onSectionLayout(0)}>
          <RefineCarousel
            title="THEME"
            options={themeOptions.map((f) => f.label)}
            initialIndex={themeCommitted[0] ?? 0}
            committedIndices={themeCommitted}
            onSelect={(i) => setCommittedThemes((cur) => toggle(cur, themeOptions[i].id))}
          />
        </View>
        <View onLayout={onSectionLayout(1)}>
          <RefineCarousel
            title="PALETTE"
            options={paletteOptions.map((p) => p.label)}
            initialIndex={paletteCommitted[0] ?? 0}
            committedIndices={paletteCommitted}
            onSelect={(i) => setCommittedPalettes((cur) => toggle(cur, paletteOptions[i].id))}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 148 }, // clear the floating nav with room to spare
});
