import { Heart } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SavedEntry, useSaved } from '../../saved/SavedContext';
import { font } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';
import { SaveSheet } from './SaveSheet';

/** A labelled placeholder box (tinted from the world's palette). */
function Slot({ label, color, style }: { label: string; color: string; style?: object }) {
  const c = useTokens();
  return (
    <View style={[styles.slot, { backgroundColor: color }, style]}>
      <Text style={[styles.slotLabel, { color: c.ink }]}>{label}</Text>
    </View>
  );
}

/**
 * Panel 1 — the overview ("view world"): a full-width hero of the look, then a
 * three-up detail grid. A heart on the hero saves the WHOLE world. Placeholders
 * are tinted from the world's palette; scrolls inside the horizontal pager.
 */
export function OverviewPanel({
  width,
  world,
  palette,
  pieces,
}: {
  width: number;
  world: string;
  palette: string[];
  pieces: number;
}) {
  const c = useTokens();
  const { isSaved } = useSaved();
  const [saveOpen, setSaveOpen] = useState(false);

  // Cycle through the palette so the tiles vary within one world's colours.
  const tint = (i: number) => palette[i % palette.length] ?? c.hairline;

  const worldEntry: SavedEntry = {
    key: `world:${world}`,
    kind: 'world',
    title: world || 'This world',
    subtitle: `${pieces} pieces`,
    color: palette[0] ?? c.hairline,
    world,
  };
  const saved = isSaved(worldEntry.key);

  return (
    <>
      <ScrollView
        style={[styles.panel, { width, backgroundColor: c.bg }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroWrap}>
          <Slot label={world || 'The look'} color={tint(0)} style={styles.hero} />
          {/* Save the whole world. */}
          <Pressable
            onPress={() => setSaveOpen(true)}
            hitSlop={8}
            style={[styles.saveBtn, { backgroundColor: c.bg, borderColor: c.hairline }]}
          >
            <Heart size={22} weight={saved ? 'fill' : 'regular'} color={saved ? c.soul : c.ink} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          <Slot label="Detail" color={tint(1)} style={styles.tall} />
          <View style={styles.stack}>
            <Slot label="Detail" color={tint(2)} style={styles.small} />
            <Slot label="Detail" color={tint(3)} style={styles.small} />
          </View>
        </View>
      </ScrollView>

      <SaveSheet visible={saveOpen} onClose={() => setSaveOpen(false)} entry={worldEntry} />
    </>
  );
}

const GAP = 10;
const ROW = 176;

const styles = StyleSheet.create({
  panel: { flex: 1 },
  content: { paddingBottom: 40 },
  heroWrap: {},
  hero: { width: '100%', height: 480, borderRadius: 0 },
  saveBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  grid: {
    flexDirection: 'row',
    gap: GAP,
    padding: 14,
  },
  tall: { flex: 1, height: ROW * 2 + GAP, borderRadius: 12 },
  stack: { flex: 1, gap: GAP },
  small: { width: '100%', height: ROW, borderRadius: 12 },
  slot: { alignItems: 'center', justifyContent: 'center' },
  slotLabel: { fontFamily: font.regular, fontSize: 13, opacity: 0.55 },
});
