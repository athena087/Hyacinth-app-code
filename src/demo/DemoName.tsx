// ─────────────────────────────────────────────────────────────────────────────
// DEMO-ONLY FEATURE — easy to remove.
// A launch landing page that asks the user's name, used by the Home greeting and
// the Profile caption. Session-scoped (NOT persisted), so it reappears on every
// app refresh — intentional for demos.
//
// To remove entirely:
//   1. Delete this file (src/demo/).
//   2. In src/app/_layout.tsx, drop the <DemoNameProvider>/<DemoNameGate> wrap.
//   3. In HomeScreen & ProfileScreen, replace `useDemoName().name` with a literal
//      (e.g. 'Athena').
// ─────────────────────────────────────────────────────────────────────────────
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { font, space } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

type DemoNameValue = { name: string; setName: (n: string) => void };
const DemoNameContext = createContext<DemoNameValue | null>(null);

export function DemoNameProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState(''); // session-scoped — blank on each launch
  const value = useMemo(() => ({ name, setName }), [name]);
  return <DemoNameContext.Provider value={value}>{children}</DemoNameContext.Provider>;
}

export function useDemoName(): DemoNameValue {
  const ctx = useContext(DemoNameContext);
  if (!ctx) throw new Error('useDemoName must be used within a DemoNameProvider');
  return ctx;
}

/** Renders the name prompt until a name is entered, then the app. */
export function DemoNameGate({ children }: { children: ReactNode }) {
  const { name } = useDemoName();
  if (!name) return <NamePrompt />;
  return <>{children}</>;
}

function NamePrompt() {
  const c = useTokens();
  const { setName } = useDemoName();
  const [value, setValue] = useState('');
  const submit = () => {
    const t = value.trim();
    if (t) setName(t);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: c.bg }]}
    >
      <View style={styles.center}>
        <Text style={[styles.brand, { color: c.soul }]}>Hyacinth</Text>
        <Text style={[styles.title, { color: c.ink }]}>What should we call you?</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Your name"
          placeholderTextColor={c.ink + '8C'}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
          style={[styles.input, { color: c.ink, backgroundColor: c.surface, borderColor: c.hairline }]}
        />
        <Pressable
          onPress={submit}
          disabled={!value.trim()}
          style={[styles.button, { backgroundColor: c.soul, opacity: value.trim() ? 1 : 0.4 }]}
        >
          <Text style={[styles.buttonText, { color: c.onSoul }]}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  brand: {
    fontFamily: font.semibold,
    fontSize: 15,
    letterSpacing: 0.08 * 15,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  title: {
    fontFamily: font.medium,
    fontSize: 32,
    letterSpacing: -0.01 * 32,
    lineHeight: 32 * 1.12,
    marginBottom: 26,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    fontFamily: font.regular,
    fontSize: 17,
  },
  button: {
    marginTop: 16,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: font.semibold, fontSize: 16 },
});
