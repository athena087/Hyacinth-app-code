import { Check, Plus } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SavedEntry, useSaved } from '../../saved/SavedContext';
import { font, space } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * The board picker — a bottom sheet listing your boards with a check where the
 * entry is saved (tap toggles per-board), plus "New list" with inline naming.
 */
export function SaveSheet({
  visible,
  onClose,
  entry,
}: {
  visible: boolean;
  onClose: () => void;
  entry: SavedEntry | null;
}) {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { boards, boardsForKey, save, unsave, createBoard } = useSaved();

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setCreating(false);
      setNewTitle('');
    }
  }, [visible]);

  const savedIn = entry ? boardsForKey(entry.key) : [];

  const toggle = (boardId: string) => {
    if (!entry) return;
    if (savedIn.includes(boardId)) unsave(entry.key, boardId);
    else save(entry, boardId);
  };
  const create = () => {
    if (!entry) return;
    const id = createBoard(newTitle);
    save(entry, id);
    setNewTitle('');
    setCreating(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.fill}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: c.bg,
                paddingBottom: insets.bottom + 16,
                // Always a full sheet reaching the bottom, even with few boards.
                minHeight: screenH * 0.62,
                maxHeight: screenH * 0.88,
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: c.hairline }]} />
            <Text style={[styles.title, { color: c.ink }]}>Save to…</Text>
            {entry ? (
              <Text style={[styles.sub, { color: c.ink }]} numberOfLines={1}>
                {entry.title}
              </Text>
            ) : null}

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {boards.map((b) => {
                const on = savedIn.includes(b.id);
                return (
                  <Pressable key={b.id} onPress={() => toggle(b.id)} style={styles.row}>
                    <View
                      style={[
                        styles.thumb,
                        { backgroundColor: b.entries[0]?.color ?? c.hairline },
                      ]}
                    />
                    <View style={styles.rowMeta}>
                      <Text style={[styles.boardTitle, { color: c.ink }]} numberOfLines={1}>
                        {b.title}
                      </Text>
                      <Text style={[styles.boardCount, { color: c.ink }]}>
                        {b.entries.length} saved
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tick,
                        on
                          ? { backgroundColor: c.ink, borderColor: c.ink }
                          : { borderColor: c.hairline },
                      ]}
                    >
                      {on ? <Check size={15} weight="bold" color={c.bg} /> : null}
                    </View>
                  </Pressable>
                );
              })}

              {creating ? (
                <View style={styles.newRow}>
                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="List name"
                    placeholderTextColor={c.ink + '8C'}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={create}
                    style={[styles.newInput, { color: c.ink, backgroundColor: c.surface, borderColor: c.hairline }]}
                  />
                  <Pressable onPress={create} style={[styles.createBtn, { backgroundColor: c.ink }]}>
                    <Text style={[styles.createText, { color: c.bg }]}>Create</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setCreating(true)} style={styles.row}>
                  <View style={[styles.thumb, styles.newThumb, { borderColor: c.hairline }]}>
                    <Plus size={20} color={c.ink} />
                  </View>
                  <Text style={[styles.boardTitle, { color: c.ink }]}>New list</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: space.md },
  title: { fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.01 * 22 },
  sub: { marginTop: 4, fontFamily: font.regular, fontSize: 14, opacity: 0.55 },
  list: { flex: 1, marginTop: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  newThumb: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowMeta: { flex: 1 },
  boardTitle: { fontFamily: font.semibold, fontSize: 16 },
  boardCount: { fontFamily: font.regular, fontSize: 13, opacity: 0.55, marginTop: 2 },
  tick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  newInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: font.regular,
    fontSize: 15,
  },
  createBtn: { height: 46, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  createText: { fontFamily: font.semibold, fontSize: 14 },
});
