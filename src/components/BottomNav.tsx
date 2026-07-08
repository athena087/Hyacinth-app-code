import { Basket, House, MagnifyingGlass, User } from 'phosphor-react-native';
import type { IconProps } from 'phosphor-react-native';
import { ComponentType, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

// LayoutAnimation needs opting-in on old-architecture Android for the
// active-pill width to tween (~150ms) rather than jump.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = { key: string; Icon: ComponentType<IconProps> };

const TABS: Tab[] = [
  { key: 'home', Icon: House },
  { key: 'search', Icon: MagnifyingGlass },
  { key: 'basket', Icon: Basket },
  { key: 'profile', Icon: User },
];

/**
 * Floating pill nav. Active tab gets a tint-filled pill with a Fill-weight icon
 * (the design system's one sanctioned Regular→Fill swap); inactive tabs are
 * transparent with Regular-weight ink icons. Tab selection is local visual
 * state only — no routing yet, since the other screens don't exist.
 */
export function BottomNav() {
  const c = useTokens();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: space.xxxl - 6 + insets.bottom }]}
    >
      <View
        style={[
          styles.pill,
          { backgroundColor: c.surface, borderColor: c.hairline },
        ]}
      >
        {TABS.map((tab, i) => {
          const isActive = i === active;
          const Icon = tab.Icon;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.create(
                    150,
                    LayoutAnimation.Types.easeOut,
                    LayoutAnimation.Properties.opacity,
                  ),
                );
                setActive(i);
              }}
              style={[
                styles.button,
                {
                  width: isActive ? 60 : 46,
                  backgroundColor: isActive ? c.tint : 'transparent',
                },
              ]}
            >
              <Icon
                size={26}
                weight={isActive ? 'fill' : 'regular'}
                color={isActive ? c.tintInk : c.ink}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 28,
    paddingVertical: space.sm,
    paddingHorizontal: 14,
    // Soft lift matching the mock's layered shadow.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.13,
    shadowRadius: 30,
    elevation: 8,
  },
  button: {
    height: 46,
    borderRadius: radius.control + 9, // 15px, per mock
    alignItems: 'center',
    justifyContent: 'center',
  },
});
