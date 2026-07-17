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
  /** The world this belongs to — used to reopen it from a board. */
  world?: string;
};

export type Board = { id: string; title: string; entries: SavedEntry[] };

// v2: starts with no boards. Bumped so any previously-seeded boards from the
// earlier default are dropped, guaranteeing a clean empty start.
const STORAGE_KEY = 'hyacinth.savedBoards.v2';

// No boards to begin with — the user's first save creates one.
const DEFAULT_BOARDS: Board[] = [];

type SavedValue = {
  boards: Board[];
  /** Ids of the boards containing `key`. */
  boardsForKey: (key: string) => string[];
  /** Saved in any board? (drives the filled heart). */
  isSaved: (key: string) => boolean;
  save: (entry: SavedEntry, boardId: string) => void;
  unsave: (key: string, boardId: string) => void;
  /** Create a board (optionally seeded with an entry); returns its id. */
  createBoard: (title: string, entry?: SavedEntry) => string;
  /** Delete a whole board. */
  deleteBoard: (id: string) => void;
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
    (title: string, entry?: SavedEntry) => {
      const id = `b-${Date.now().toString(36)}`;
      // Seed the entry in the same write — a separate save() would read a stale
      // boardsRef (not yet re-rendered) and clobber this new board.
      persist([
        ...boardsRef.current,
        { id, title: title.trim() || 'New list', entries: entry ? [entry] : [] },
      ]);
      return id;
    },
    [persist],
  );

  const deleteBoard = useCallback(
    (id: string) => {
      persist(boardsRef.current.filter((b) => b.id !== id));
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
      deleteBoard,
    }),
    [boards, save, unsave, createBoard, deleteBoard],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within a SavedProvider');
  return ctx;
}
