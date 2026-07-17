import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { font, textOpacity } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { createFeedSource } from './feedSource';
import { useRotatingGreeting } from './useRotatingGreeting';
import { WorldReel } from './WorldReel';
import type { World } from './worlds';

// Placeholder until auth/user data exists.
const USER_NAME = 'Athena';
const INITIAL_BATCH = 6; // small buffer of worlds ahead of the current page
const PAGE = 6;

export default function HomeScreen() {
  const c = useTokens();
  const router = useRouter();
  const greeting = useRotatingGreeting(USER_NAME);

  // Endless feed source, kept per-mount so its cursor/id state is self-contained.
  const source = useRef(createFeedSource()).current;
  const [data, setData] = useState<World[]>(() => source.next(INITIAL_BATCH));

  // Swiping a world left opens the (static) View Item screen, as on results.
  const openItem = (label: string) =>
    router.push({ pathname: '/item', params: { world: label } });

  // Instant append — no spinner/delay: pull the next batch when nearing the end.
  const loadMore = useCallback(() => {
    setData((cur) => [...cur, ...source.next(PAGE)]);
  }, [source]);

  const header = (
    <>
      <Text style={[styles.eyebrow, { color: c.ink }]}>FOR YOU</Text>
      <Text style={[styles.title, { color: c.ink }]}>{greeting}</Text>
    </>
  );

  return <WorldReel data={data} onEndReached={loadMore} onOpen={openItem} header={header} />;
}

const styles = StyleSheet.create({
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
