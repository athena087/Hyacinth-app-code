export type World = {
  id: string;
  /** Placeholder label shown in the hero slot until real imagery exists. */
  heroLabel: string;
  pieces: number;
};

/** Hardcoded feed — no recommendation backend yet. */
export const WORLDS: World[] = [
  { id: 'sunroom', heroLabel: 'World hero — Sunroom, 3pm', pieces: 14 },
  { id: 'coast', heroLabel: 'World hero — Slow coast morning', pieces: 9 },
  { id: 'nook', heroLabel: 'World hero — Reading nook, dusk', pieces: 11 },
];
