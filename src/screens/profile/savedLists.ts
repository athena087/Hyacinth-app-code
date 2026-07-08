export type SavedList = {
  id: string;
  title: string;
  pieces: number;
};

/** Hardcoded saved lists — no backend yet. Each shows 3 placeholder thumbs. */
export const SAVED_LISTS: SavedList[] = [
  { id: 'sunlit', title: 'Sunlit rooms', pieces: 14 },
  { id: 'coastal', title: 'Coastal calm', pieces: 9 },
  { id: 'nooks', title: 'Reading nooks', pieces: 11 },
];
