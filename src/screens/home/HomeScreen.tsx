import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, space, textOpacity } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { WorldCard } from './WorldCard';
import { WORLDS } from './worlds';

// Placeholder until auth/user data exists.
const USER_NAME = 'Athena';

export default function HomeScreen() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Any feed image opens the (static) View Item screen, same as the results feed.
  const openItem = () => router.push('/item');

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: c.surface, paddingTop: insets.top + space.xl },
          ]}
        >
          <Text style={[styles.eyebrow, { color: c.ink }]}>FOR YOU</Text>
          <Text style={[styles.title, { color: c.ink }]}>
            Welcome back {USER_NAME}
          </Text>
        </View>

        {WORLDS.map((world) => (
          <WorldCard key={world.id} world={world} onPress={openItem} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    gap: space.md,
  },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.08 * 11,
    opacity: textOpacity.secondary,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: 34,
    lineHeight: 34 * 1.25,
  },
});
