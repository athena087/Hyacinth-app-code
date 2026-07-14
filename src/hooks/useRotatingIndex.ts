import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

// Last-shown index per list, keyed by the array's identity so each message set
// (greetings, search prompts, …) remembers independently for the app session.
// This makes "no back-to-back repeat" hold across leaving/returning to a screen.
const lastByList = new WeakMap<object, number>();

/** Picks a random index into `list` that differs from the one shown last. */
function pickIndex(list: unknown[]): number {
  const n = list.length;
  if (n <= 1) return 0;
  const last = lastByList.get(list) ?? -1;
  let i = Math.floor(Math.random() * n);
  if (i === last) i = (i + 1) % n; // never the same twice in a row
  lastByList.set(list, i);
  return i;
}

/**
 * Returns an index into `list` that changes every time the screen gains focus
 * (first open, and each time you leave and come back), never repeating the
 * previous pick. `list` must be a stable reference (a module-level constant).
 */
export function useRotatingIndex(list: unknown[]): number {
  const [index, setIndex] = useState(() => pickIndex(list));
  const first = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // The initial pick is already done by useState; skip the first focus so
      // we don't immediately re-roll on mount, then re-pick on every return.
      if (first.current) {
        first.current = false;
        return;
      }
      setIndex(pickIndex(list));
    }, [list]),
  );

  return index;
}
