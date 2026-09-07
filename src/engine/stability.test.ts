import { beforeEach, describe, expect, it } from 'vitest';
import { midiToFrequency } from './music.js';
import { createStabilityTracker, DEFAULT_STABILITY, type StabilityTracker } from './stability.js';

const GOOD = { clarity: 0.98, rms: 0.2 };

function sing(tracker: StabilityTracker, midi: number, timeMs: number): number | null {
  return tracker.push({ frequency: midiToFrequency(midi), timeMs, ...GOOD });
}

describe('createStabilityTracker', () => {
  let tracker: StabilityTracker;

  beforeEach(() => {
    tracker = createStabilityTracker(DEFAULT_STABILITY);
  });

  it('accepts a note held for the full hold time', () => {
    expect(sing(tracker, 60, 0)).toBeNull();
    expect(sing(tracker, 60, 200)).toBeNull();
    expect(sing(tracker, 60, 300)).toBe(60);
  });

  it('accepts the note only once', () => {
    sing(tracker, 60, 0);
    expect(sing(tracker, 60, 300)).toBe(60);
    expect(sing(tracker, 60, 320)).toBeNull();
  });

  it('restarts the hold when the note changes', () => {
    sing(tracker, 60, 0);
    sing(tracker, 62, 250);
    expect(sing(tracker, 62, 400)).toBeNull();
    expect(sing(tracker, 62, 550)).toBe(62);
  });

  it('ignores frames below the level threshold', () => {
    tracker.push({ frequency: midiToFrequency(60), clarity: 0.99, rms: 0.001, timeMs: 0 });
    expect(tracker.rejection()).toBe('silent');
    expect(sing(tracker, 60, 300)).toBeNull();
  });

  it('ignores frames below the clarity threshold', () => {
    tracker.push({ frequency: midiToFrequency(60), clarity: 0.3, rms: 0.2, timeMs: 0 });
    expect(tracker.rejection()).toBe('unclear');
    expect(sing(tracker, 60, 300)).toBeNull();
  });

  it('ignores frames without a detected pitch', () => {
    tracker.push({ frequency: null, clarity: 0.99, rms: 0.2, timeMs: 0 });
    expect(tracker.rejection()).toBe('unclear');
  });

  it('never accepts a note outside C3 to C5', () => {
    for (const timeMs of [0, 300, 600]) sing(tracker, 40, timeMs);
    expect(tracker.rejection()).toBe('out-of-range');
    expect(sing(tracker, 40, 900)).toBeNull();
  });

  it('clears the rejection reason on a good frame', () => {
    tracker.push({ frequency: null, clarity: 0.99, rms: 0.2, timeMs: 0 });
    sing(tracker, 60, 10);
    expect(tracker.rejection()).toBeNull();
  });

  it('drops the candidate on reset', () => {
    sing(tracker, 60, 0);
    tracker.reset();
    expect(sing(tracker, 60, 300)).toBeNull();
  });
});
