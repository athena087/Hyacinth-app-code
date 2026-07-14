import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { GREETINGS } from './greetings';

// Index of the last greeting shown, held at module scope so "don't repeat the
// previous line" holds across leaving/returning to Home for the whole app
// session. Resets to -1 only on a full restart (session-only persistence).
let lastIndex = -1;

/** Picks a random greeting index that differs from the previous one. */
function pickIndex(): number {
  const n = GREETINGS.length;
  if (n <= 1) return 0;
  let i = Math.floor(Math.random() * n);
  if (i === lastIndex) i = (i + 1) % n; // never the same twice in a row
  lastIndex = i;
  return i;
}

/**
 * Returns a greeting that changes every time the Home screen gains focus
 * (first open, and each time you leave and come back), formatted as the chosen
 * greeting phrase, a line break, then the name (greeting + newline + name).
 */
export function useRotatingGreeting(name: string): string {
  const [index, setIndex] = useState(pickIndex);
  const first = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // The initial pick is already done by useState; skip the first focus so
      // we don't immediately re-roll on mount, then re-pick on every return.
      if (first.current) {
        first.current = false;
        return;
      }
      setIndex(pickIndex());
    }, []),
  );

  return `${GREETINGS[index]}\n${name}`;
}
