import { frequencyToMidi, isInRange } from './music.js';

/** One microphone frame from the pitch detector. */
export interface PitchSample {
  /** Detected frequency in hertz, or null when the detector found no pitch. */
  frequency: number | null;
  /** Detector confidence between 0 and 1. */
  clarity: number;
  /** Root mean square level of the frame between 0 and 1. */
  rms: number;
  /** Frame time in milliseconds. */
  timeMs: number;
}

/** Why the tracker discarded a sample. */
export type Rejection = 'silent' | 'unclear' | 'out-of-range' | null;

export interface StabilityOptions {
  /** How long one MIDI note must hold before the tracker accepts it. */
  holdMs: number;
  /** Lowest detector confidence the tracker accepts. */
  minClarity: number;
  /** Lowest frame level the tracker accepts. */
  minRms: number;
}

export const DEFAULT_STABILITY: StabilityOptions = {
  holdMs: 300,
  minClarity: 0.9,
  minRms: 0.02,
};

export interface StabilityTracker {
  /** Feeds one frame. Returns a MIDI note once the note held long enough. */
  push(sample: PitchSample): number | null;
  /** Returns why the tracker discarded the last frame. */
  rejection(): Rejection;
  /** Drops the current candidate. */
  reset(): void;
}

/**
 * Accepts a sung note only after the same MIDI note holds for `holdMs`.
 * The caller supplies the time, so the tracker stays pure and testable.
 */
export function createStabilityTracker(
  options: StabilityOptions = DEFAULT_STABILITY,
): StabilityTracker {
  let candidate: number | null = null;
  let since = 0;
  let lastRejection: Rejection = null;

  const reset = (): void => {
    candidate = null;
    since = 0;
  };

  return {
    push(sample) {
      if (sample.rms < options.minRms) {
        lastRejection = 'silent';
        reset();
        return null;
      }
      if (sample.frequency === null || sample.clarity < options.minClarity) {
        lastRejection = 'unclear';
        reset();
        return null;
      }

      const midi = frequencyToMidi(sample.frequency);
      if (!isInRange(midi)) {
        lastRejection = 'out-of-range';
        reset();
        return null;
      }

      lastRejection = null;
      if (midi !== candidate) {
        candidate = midi;
        since = sample.timeMs;
        return null;
      }
      if (sample.timeMs - since < options.holdMs) return null;

      reset();
      return midi;
    },

    rejection() {
      return lastRejection;
    },

    reset,
  };
}
