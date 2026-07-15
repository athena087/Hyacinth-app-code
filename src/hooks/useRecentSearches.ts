import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'hyacinth.recentSearches';
const MAX_RECENTS = 8;

/**
 * Device-local recent search history — the single interface the search UI talks
 * to. Today it is backed by AsyncStorage (per-device, no account needed); when
 * accounts arrive this hook can swap its backing to a server + merge-on-login
 * WITHOUT any change to the screens that consume it.
 *
 * The in-memory `recents` array is the source of truth for render (so the UI is
 * instant); every mutation also writes through to storage in the background.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);
  // Mirror of the latest list so mutations can compute the next value without
  // doing side effects inside a (must-stay-pure) state updater.
  const recentsRef = useRef<string[]>(recents);
  recentsRef.current = recents;
  // Guard against a late storage read clobbering edits made before it resolved.
  const hydrated = useRef(false);

  // Load once on mount; until it resolves the list stays blank.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || hydrated.current) return;
        hydrated.current = true;
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setRecents(parsed.filter((x): x is string => typeof x === 'string'));
          }
        } catch {
          // Corrupt value — ignore and start blank.
        }
      })
      .catch(() => {
        // Storage unavailable — degrade to an in-memory session.
      });
    return () => {
      active = false;
    };
  }, []);

  // Apply a computed list: mark hydration done (so the initial read can't undo
  // it), update state, and write through to storage in the background.
  const commit = useCallback((next: string[]) => {
    hydrated.current = true;
    setRecents(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Best-effort write; the in-memory list still reflects the change.
    });
  }, []);

  // Record an executed search: trim, drop empties, case-insensitive move-to-top,
  // cap at the most recent MAX_RECENTS.
  const add = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      const rest = recentsRef.current.filter(
        (r) => r.toLowerCase() !== q.toLowerCase(),
      );
      commit([q, ...rest].slice(0, MAX_RECENTS));
    },
    [commit],
  );

  const remove = useCallback(
    (query: string) => {
      commit(recentsRef.current.filter((r) => r !== query));
    },
    [commit],
  );

  const clear = useCallback(() => commit([]), [commit]);

  return { recents, add, remove, clear };
}
