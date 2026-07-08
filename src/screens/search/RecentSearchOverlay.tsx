import { CaretLeft, ClockCounterClockwise, MagnifyingGlass, X } from 'phosphor-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { SEARCH_PLACEHOLDER } from './searchData';

/**
 * Full-screen search overlay shown when the hero search field is tapped.
 * Rendered in a Modal so it covers the tab bar (matching the mock's z-50
 * full-screen search mode). Text isn't wired to filtering yet — future work.
 */
export function RecentSearchOverlay({
  visible,
  recents,
  onCancel,
  onSelectRecent,
  onRemoveRecent,
}: {
  visible: boolean;
  recents: string[];
  onCancel: () => void;
  onSelectRecent: (text: string) => void;
  onRemoveRecent: (index: number) => void;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel} transparent={false}>
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.md }]}>
        <View style={styles.searchRow}>
          <Pressable onPress={onCancel} hitSlop={8} style={styles.back}>
            <CaretLeft size={26} color={c.ink} />
          </Pressable>
          <View style={[styles.field, { backgroundColor: c.surface, borderColor: c.ink }]}>
            <MagnifyingGlass size={20} color={c.ink} style={{ opacity: 0.55 }} />
            <TextInput
              autoFocus
              placeholder={SEARCH_PLACEHOLDER}
              placeholderTextColor={c.ink + '8C'} // ~0.55 alpha
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
          <Text style={[styles.sectionLabel, { color: c.ink }]}>RECENT</Text>
          {recents.map((text, i) => (
            <Pressable
              key={text}
              onPress={() => onSelectRecent(text)}
              style={styles.recentRow}
            >
              <ClockCounterClockwise size={20} color={c.ink} style={{ opacity: 0.55 }} />
              <Text style={[styles.recentText, { color: c.ink }]} numberOfLines={1}>
                {text}
              </Text>
              <Pressable onPress={() => onRemoveRecent(i)} hitSlop={8} style={styles.remove}>
                <X size={16} color={c.ink} style={{ opacity: 0.55 }} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
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
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 0.1 * 12,
    opacity: 0.55,
    paddingHorizontal: 12,
    paddingTop: space.sm,
    paddingBottom: space.xs,
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
