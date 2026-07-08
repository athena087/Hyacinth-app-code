import type { IconProps } from 'phosphor-react-native';
import { ComponentType, forwardRef } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

/**
 * Floating pill container. Rendered as the target of `<TabList asChild>`, so it
 * receives the tab triggers as `children` and the row is positioned absolutely,
 * letting screen content scroll underneath it.
 */
export const BottomNav = forwardRef<View, ViewProps>(function BottomNav(
  { children, style, ...rest },
  ref,
) {
  const c = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <View
      ref={ref}
      pointerEvents="box-none"
      // Incoming `style` first so our floating layout wins over TabList's default row styling.
      style={[style as ViewProps['style'], styles.wrap, { bottom: insets.bottom + space.xs }]}
      {...rest}
    >
      <View style={[styles.pill, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        {children}
      </View>
    </View>
  );
});

type NavButtonProps = Omit<PressableProps, 'children'> & {
  icon: ComponentType<IconProps>;
  /** Supplied by TabTrigger (asChild) for real tabs; false for inert buttons. */
  isFocused?: boolean;
  /** Passed by TabTrigger; unused visually. */
  href?: string;
};

/**
 * A single nav icon. Active tab gets a wider tint pill + Fill-weight icon (the
 * design system's one sanctioned Regular→Fill swap); inactive/inert tabs are
 * transparent with a Regular ink icon. forwardRef so TabTrigger's Slot can wire
 * press handlers onto the underlying Pressable.
 */
export const NavButton = forwardRef<View, NavButtonProps>(function NavButton(
  { icon: Icon, isFocused = false, href: _href, style, ...rest },
  ref,
) {
  const c = useTokens();

  return (
    <Pressable
      ref={ref}
      style={[
        styles.button,
        {
          width: isFocused ? 60 : 46,
          backgroundColor: isFocused ? c.tint : 'transparent',
        },
      ]}
      {...rest}
    >
      <Icon
        size={26}
        weight={isFocused ? 'fill' : 'regular'}
        color={isFocused ? c.tintInk : c.ink}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Own the layout explicitly: TabList (asChild) leaks its default
    // flexDirection:'row' + justifyContent:'space-between' onto this View, which
    // would otherwise shove the single pill to the left edge instead of center.
    flexDirection: 'row',
    justifyContent: 'center',
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
