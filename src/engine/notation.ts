/** Clefs, staff sets and the ledger lines a note needs. */

import { midiToOctave } from './music.js';

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor';

/** A staff set names the clefs the app draws at the same time. */
export type StaffSet = 'grand' | 'treble' | 'bass' | 'alto' | 'tenor';

/** The clefs of every staff set. The grand staff shows one note in two clefs. */
export const STAFF_SETS: Record<StaffSet, readonly Clef[]> = {
  grand: ['treble', 'bass'],
  treble: ['treble'],
  bass: ['bass'],
  alto: ['alto'],
  tenor: ['tenor'],
};

/**
 * How far a note may sit outside a staff before the staff drops it. Two ledger
 * lines stay readable. E2 needs seven on a treble staff and reads as a puzzle.
 */
export const MAX_LEDGER_LINES = 2;

/** The letter of each pitch class, counted as steps from C. */
const LETTER_STEPS = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6] as const;

/** The notes on the bottom and the top line of every staff. */
const STAFF_LINES: Record<Clef, { bottom: number; top: number }> = {
  treble: { bottom: 64, top: 77 }, // E4 to F5
  bass: { bottom: 43, top: 57 }, // G2 to A3
  alto: { bottom: 53, top: 67 }, // F3 to G4
  tenor: { bottom: 50, top: 64 }, // D3 to E4
};

/** Counts the note letters from C0. C4 and C#4 share one step. */
export function diatonicStep(midi: number): number {
  const letter = LETTER_STEPS[((midi % 12) + 12) % 12];
  if (letter === undefined) throw new RangeError(`invalid midi note: ${midi}`);
  return letter + 7 * midiToOctave(midi);
}

/** Counts the ledger lines the note needs on that clef. */
export function ledgerLines(clef: Clef, midi: number): number {
  const lines = STAFF_LINES[clef];
  const step = diatonicStep(midi);
  const bottom = diatonicStep(lines.bottom);
  const top = diatonicStep(lines.top);

  if (step < bottom) return Math.floor((bottom - step) / 2);
  if (step > top) return Math.floor((step - top) / 2);
  return 0;
}

/**
 * Picks the clefs that show the note well. A grand staff shows the note in both
 * clefs while both stay readable. An extreme note stays on its own staff.
 */
export function clefsForNote(clefs: readonly Clef[], midi: number): Clef[] {
  const readable = clefs.filter((clef) => ledgerLines(clef, midi) <= MAX_LEDGER_LINES);
  if (readable.length > 0) return readable;

  const closest = [...clefs].sort((a, b) => ledgerLines(a, midi) - ledgerLines(b, midi))[0];
  return closest ? [closest] : [];
}

/** Reports if the value names a staff set the app supports. */
export function isStaffSet(value: string): value is StaffSet {
  // Object.hasOwn ignores inherited keys such as "toString".
  return Object.hasOwn(STAFF_SETS, value);
}
