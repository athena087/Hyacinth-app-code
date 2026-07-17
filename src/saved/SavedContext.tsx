import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SavedEntry = {
  /** Unique: `world:<name>` or `item:<world>:<style>`. */
  key: string;
  kind: 'world' | 'item';
  title: string;
  subtitle?: string;
  /** Thumbnail tint (from the world/item palette). */
  color: string;
};

export type Board = { id: string; title: string; entries: SavedEntry[] };

const STORAGE_KEY = 'hyacinth.savedBoards';

// Seed with a few empty boards so the picker (and Profile) aren't blank. Reuses
// the titles the Profile mock already showed.
const DEFAULT_BOARDS: Board[] = [
  { id: 'sunlit', title: 'Sunlit rooms', entries: [] },
  { id: 'coastal', title: 'Coastal calm', entries: [] },
  { id: 'nooks', title: 'Reading nooks', entries: [] },
];

type SavedValue = {
  boards: Board[];
  /** Ids of the boards containing `key`. */
  boardsForKey: (key: string) => string[];
  /** Saved in any board? (drives the filled heart). */
  isSaved: (key: string) => boolean;
  save: (entry: SavedEntry, boardId: string) => void;
  unsave: (key: string, boardId: string) => void;
  /** Create a board; returns its id. */
  createBoard: (title: string) => string;
};

const SavedContext = createContext<SavedValue | null>(null);

/**
 * Global saved-boards state — the source of truth for both the View Item save
 * actions (writes) and the Profile boards (reads). Device-local via AsyncStorage
 * (mirrors useRecentSearches); the interface swaps to accounts later untouched.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>(DEFAULT_BOARDS);
  const boardsRef = useRef(boards);
  boardsRef.current = boards;
  const hydrated = useRef(false);

  // Load once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || hydrated.current) return;
        hydrated.current = true;
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setBoards(parsed);
        } catch {
          // Corrupt — keep defaults.
        }
      })
      .catch(() => {
        // Storage unavailable — degrade to an in-memory session.
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: Board[]) => {
    hydrated.current = true;
    setBoards(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const save = useCallback(
    (entry: SavedEntry, boardId: string) => {
      persist(
        boardsRef.current.map((b) =>
          b.id !== boardId || b.entries.some((e) => e.key === entry.key)
            ? b
            : { ...b, entries: [entry, ...b.entries] },
        ),
      );
    },
    [persist],
  );

  const unsave = useCallback(
    (key: string, boardId: string) => {
      persist(
        boardsRef.current.map((b) =>
          b.id === boardId ? { ...b, entries: b.entries.filter((e) => e.key !== key) } : b,
        ),
      );
    },
    [persist],
  );

  const createBoard = useCallback(
    (title: string) => {
      const id = `b-${Date.now().toString(36)}`;
      persist([...boardsRef.current, { id, title: title.trim() || 'New list', entries: [] }]);
      return id;
    },
    [persist],
  );

  const value = useMemo<SavedValue>(
    () => ({
      boards,
      boardsForKey: (key) =>
        boards.filter((b) => b.entries.some((e) => e.key === key)).map((b) => b.id),
      isSaved: (key) => boards.some((b) => b.entries.some((e) => e.key === key)),
      save,
      unsave,
      createBoard,
    }),
    [boards, save, unsave, createBoard],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within a SavedProvider');
  return ctx;
}
