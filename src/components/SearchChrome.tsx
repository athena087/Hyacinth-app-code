import { CaretLeft, MagnifyingGlass, SlidersHorizontal, X } from 'phosphor-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEARCH_PLACEHOLDER } from '../screens/search/searchData';
import { font, space } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

/**
 * Shared search chrome for the Results and Refine screens: back button, a query
 * field (editable on Results, static display on Refine), a filter button, and
 * the soul-tinted filter chips. Keeps the two screens visually in lockstep.
 */
export type Chip = { id: string; label: string };

export function SearchChrome({
  query,
  onBack,
  chips,
  onRemoveChip,
  reserveChipSpace = false,
  editable = false,
  onChangeQuery,
  onSubmit,
  onFilter,
}: {
  query: string;
  onBack: () => void;
  /** Active refinement chips (empty when none). */
  chips: Chip[];
  /** Remove a refinement via its ✕. */
  onRemoveChip?: (id: string) => void;
  /** Reserve a row's height for chips so adding one doesn't shift the layout. */
  reserveChipSpace?: boolean;
  editable?: boolean;
  onChangeQuery?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFilter?: () => void;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
      <View style={styles.searchRow}>
        <Pressable onPress={onBack} hitSlop={6} style={styles.iconBtn}>
          <CaretLeft size={26} color={c.ink} />
        </Pressable>

        <View style={[styles.field, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <MagnifyingGlass size={20} color={c.ink} style={{ opacity: 0.55 }} />
          {editable ? (
            <TextInput
              value={query}
              onChangeText={onChangeQuery}
              onSubmitEditing={() => onSubmit?.(query)}
              placeholder={SEARCH_PLACEHOLDER}
              placeholderTextColor={c.ink + '8C'} // ~0.55 alpha
              style={[styles.query, { color: c.ink }]}
              returnKeyType="search"
            />
          ) : (
            <Text style={[styles.query, { color: c.ink }]} numberOfLines={1}>
              {query}
            </Text>
          )}
        </View>

        {onFilter && (
          <Pressable onPress={onFilter} hitSlop={6} style={styles.iconBtn}>
            <SlidersHorizontal size={24} color={c.ink} />
          </Pressable>
        )}
      </View>

      {(chips.length > 0 || reserveChipSpace) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.chips}
          contentContainerStyle={styles.chipsContent}
        >
          {chips.map((chip) => (
            <View key={chip.id} style={[styles.chip, { backgroundColor: c.soul }]}>
              <Pressable onPress={() => onRemoveChip?.(chip.id)} hitSlop={8}>
                <X size={12} color={c.onSoul} style={{ opacity: 0.7 }} />
              </Pressable>
              <Text style={[styles.chipText, { color: c.onSoul }]}>{chip.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: 14,
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
  },
  query: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 15,
    padding: 0,
  },
  // Single-line horizontal scroller; fixed height reserves space so the first
  // chip never shifts the layout (empty or full, the row is the same height).
  chips: {
    height: 34,
    flexGrow: 0,
  },
  chipsContent: {
    alignItems: 'center',
    gap: 8,
  },
  // An individual refinement box, sized to its own content.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 13,
  },
});
