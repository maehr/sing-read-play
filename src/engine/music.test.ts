import { describe, expect, it } from 'vitest';
import {
  frequencyToMidi,
  isInRange,
  isSharp,
  MAX_MIDI,
  MIN_MIDI,
  midiToFrequency,
  midiToNoteName,
  midiToVexKey,
} from './music.js';

describe('frequencyToMidi', () => {
  it('maps the reference pitch to MIDI 69', () => {
    expect(frequencyToMidi(440)).toBe(69);
  });

  it('maps middle C to MIDI 60', () => {
    expect(frequencyToMidi(261.63)).toBe(60);
  });

  it('maps A#4 to MIDI 70', () => {
    expect(frequencyToMidi(466.16)).toBe(70);
  });

  it('rounds to the nearest note inside the quarter-tone band', () => {
    const quarterToneUp = 440 * 2 ** (0.49 / 12);
    const quarterToneDown = 440 * 2 ** (-0.49 / 12);
    expect(frequencyToMidi(quarterToneUp)).toBe(69);
    expect(frequencyToMidi(quarterToneDown)).toBe(69);
  });

  it('rounds past the quarter-tone band to the neighbour note', () => {
    expect(frequencyToMidi(440 * 2 ** (0.51 / 12))).toBe(70);
    expect(frequencyToMidi(440 * 2 ** (-0.51 / 12))).toBe(68);
  });
});

describe('midiToFrequency', () => {
  it('inverts frequencyToMidi', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 6);
    expect(midiToFrequency(60)).toBeCloseTo(261.6256, 3);
  });
});

describe('note names', () => {
  it('spells chromatic notes with sharps', () => {
    expect(midiToNoteName(60)).toBe('C4');
    expect(midiToNoteName(61)).toBe('C#4');
    expect(midiToNoteName(70)).toBe('A#4');
    expect(midiToNoteName(48)).toBe('C3');
    expect(midiToNoteName(72)).toBe('C5');
  });

  it('builds VexFlow keys', () => {
    expect(midiToVexKey(60)).toBe('c/4');
    expect(midiToVexKey(61)).toBe('c#/4');
    expect(midiToVexKey(47)).toBe('b/2');
  });

  it('reports sharps', () => {
    expect(isSharp(61)).toBe(true);
    expect(isSharp(60)).toBe(false);
  });
});

describe('isInRange', () => {
  it('accepts the range limits', () => {
    expect(isInRange(MIN_MIDI)).toBe(true);
    expect(isInRange(MAX_MIDI)).toBe(true);
  });

  it('rejects notes outside C3 to C5', () => {
    expect(isInRange(MIN_MIDI - 1)).toBe(false);
    expect(isInRange(MAX_MIDI + 1)).toBe(false);
  });
});
