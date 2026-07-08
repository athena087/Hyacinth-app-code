import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { font } from '../../theme/tokens';
import { useTokens } from '../../theme/useTokens';

/**
 * Text field styled per the design system: surface fill, hairline border that
 * turns to full ink on focus. Placeholder is ink at ~0.65 alpha.
 */
export function CheckoutInput({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const c = useTokens();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={c.ink + 'A6'} // ~0.65 alpha
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.input,
        { backgroundColor: c.surface, borderColor: focused ? c.ink : c.hairline, color: c.ink },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
    fontFamily: font.regular,
    fontSize: 15,
  },
});
