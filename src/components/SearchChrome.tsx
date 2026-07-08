import { CaretLeft, MagnifyingGlass, SlidersHorizontal, X } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEARCH_PLACEHOLDER } from '../screens/search/searchData';
import { font, space } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

/**
 * Shared search chrome for the Results and Refine screens: back button, a query
 * field (editable on Results, static display on Refine), a filter button, and
 * the soul-tinted filter chips. Keeps the two screens visually in lockstep.
 */
export function SearchChrome({
  query,
  onBack,
  chips,
  editable = false,
  onChangeQuery,
  onSubmit,
  onFilter,
}: {
  query: string;
  onBack: () => void;
  chips: string[];
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

      <View style={styles.chips}>
        {chips.map((label) => (
          <View key={label} style={[styles.chip, { backgroundColor: c.soul }]}>
            <X size={12} color={c.onSoul} style={styles.chipX} />
            <Text style={[styles.chipText, { color: c.onSoul }]}>{label}</Text>
          </View>
        ))}
      </View>
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
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipX: {
    position: 'absolute',
    top: 5,
    left: 7,
    opacity: 0.6,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 13,
  },
});
