/** Pitch and MIDI math. A4 = 440 Hz. Chromatic notes use sharps only. */

export const A4_MIDI = 69;
export const A4_HZ = 440;

/** Lowest note the app accepts from the microphone: C3. */
export const MIN_MIDI = 48;
/** Highest note the app accepts from the microphone: C5. */
export const MAX_MIDI = 72;

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Converts a frequency in hertz to the nearest MIDI note number. */
export function frequencyToMidi(hz: number): number {
  return Math.round(A4_MIDI + 12 * Math.log2(hz / A4_HZ));
}

/** Converts a MIDI note number to its frequency in hertz. */
export function midiToFrequency(midi: number): number {
  return A4_HZ * 2 ** ((midi - A4_MIDI) / 12);
}

/** Returns the pitch class name, for example `C#`. */
export function midiToPitchClass(midi: number): string {
  const name = SHARP_NAMES[((midi % 12) + 12) % 12];
  if (name === undefined) throw new RangeError(`invalid midi note: ${midi}`);
  return name;
}

/** Returns the scientific octave number. MIDI 60 is octave 4. */
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** Returns the scientific note name, for example `C#4`. */
export function midiToNoteName(midi: number): string {
  return `${midiToPitchClass(midi)}${midiToOctave(midi)}`;
}

/** Returns the VexFlow key of a note, for example `c#/4`. */
export function midiToVexKey(midi: number): string {
  return `${midiToPitchClass(midi).toLowerCase()}/${midiToOctave(midi)}`;
}

/** Reports if the note carries a sharp. */
export function isSharp(midi: number): boolean {
  return midiToPitchClass(midi).length === 2;
}

/** Reports if the note lies inside the sung range C3 to C5. */
export function isInRange(midi: number): boolean {
  return midi >= MIN_MIDI && midi <= MAX_MIDI;
}
