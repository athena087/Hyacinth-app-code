import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, space, textOpacity } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { useSaved } from '../../saved/SavedContext';
import { SavedListCard } from './SavedListCard';

// Placeholder until auth/user data exists.
const USER_NAME = 'Athena';

export default function ProfileScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { boards, deleteBoard } = useSaved();

  const confirmDelete = (id: string, title: string) =>
    Alert.alert('Delete list', `Remove "${title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBoard(id) },
    ]);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 122 }}
      >
        {/* Polaroid — always white paper, so its colors are fixed, not themed. */}
        <View style={[styles.polaroidWrap, { paddingTop: insets.top + space.xxl }]}>
          <View style={styles.polaroid}>
            <View style={styles.photo}>
              <Text style={styles.photoLabel}>Your photo</Text>
            </View>
            <Text style={styles.polaroidName}>{USER_NAME}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.eyebrow, { color: c.ink }]}>SAVED LISTS</Text>
          {boards.length === 0 ? (
            <Text style={[styles.empty, { color: c.ink }]}>
              No lists yet — save a world or piece to start one.
            </Text>
          ) : (
            <View style={styles.list}>
              {boards.map((board) => (
                <SavedListCard
                  key={board.id}
                  board={board}
                  onPress={() => router.push(`/board/${board.id}`)}
                  onDelete={() => confirmDelete(board.id, board.title)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  polaroidWrap: {
    paddingHorizontal: space.xl,
    paddingBottom: space.sm - 2,
    alignItems: 'flex-start',
  },
  polaroid: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    borderRadius: 3,
    transform: [{ rotate: '-2.5deg' }],
    // Deep paper-lift shadow from the mock.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 44,
    elevation: 12,
  },
  photo: {
    width: 214,
    height: 258,
    backgroundColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    fontFamily: font.regular,
    fontSize: 14,
    color: '#707070',
  },
  polaroidName: {
    fontFamily: font.medium,
    fontSize: 19,
    letterSpacing: 0.01 * 19,
    color: '#2A2A2A',
    textAlign: 'center',
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: space.lg + space.xs, // 20
    paddingTop: space.xl - 2,
  },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.1 * 11,
    opacity: textOpacity.secondary,
    paddingHorizontal: 2,
    paddingBottom: 14,
  },
  list: {
    gap: 14,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: 14,
    opacity: 0.5,
    paddingVertical: space.md,
  },
});
