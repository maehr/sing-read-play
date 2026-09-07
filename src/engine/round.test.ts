import { describe, expect, it } from 'vitest';
import { accuracy, INITIAL_STATE, type RoundEvent, type RoundState, reduce } from './round.js';

function run(events: RoundEvent[], from: RoundState = INITIAL_STATE): RoundState {
  return events.reduce(reduce, from);
}

describe('reduce', () => {
  it('leaves setup on start', () => {
    expect(run([{ type: 'start' }]).phase).toBe('listening');
  });

  it('shows the sung note and waits for the keyboard', () => {
    const state = run([{ type: 'start' }, { type: 'pitch-accepted', midi: 60 }]);
    expect(state.phase).toBe('waiting');
    expect(state.target).toBe(60);
  });

  it('counts a first-try correct round', () => {
    const state = run([
      { type: 'start' },
      { type: 'pitch-accepted', midi: 60 },
      { type: 'midi-note', midi: 60 },
    ]);
    expect(state.phase).toBe('correct');
    expect(state.rounds).toBe(1);
    expect(state.firstTryCorrect).toBe(1);
    expect(accuracy(state)).toBe(100);
  });

  it('keeps the target after a wrong key and counts the round on the retry', () => {
    const wrong = run([
      { type: 'start' },
      { type: 'pitch-accepted', midi: 60 },
      { type: 'midi-note', midi: 62 },
    ]);
    expect(wrong.phase).toBe('incorrect');
    expect(wrong.target).toBe(60);
    expect(wrong.attempts).toBe(1);
    expect(wrong.rounds).toBe(0);

    const right = reduce(wrong, { type: 'midi-note', midi: 60 });
    expect(right.phase).toBe('correct');
    expect(right.rounds).toBe(1);
    expect(right.firstTryCorrect).toBe(0);
    expect(accuracy(right)).toBe(0);
  });

  it('treats the same pitch class in a wrong octave as incorrect', () => {
    const state = run([
      { type: 'start' },
      { type: 'pitch-accepted', midi: 60 },
      { type: 'midi-note', midi: 48 },
    ]);
    expect(state.phase).toBe('incorrect');
  });

  it('starts the next round after a correct answer', () => {
    const state = run([
      { type: 'start' },
      { type: 'pitch-accepted', midi: 60 },
      { type: 'midi-note', midi: 60 },
      { type: 'next' },
    ]);
    expect(state.phase).toBe('listening');
    expect(state.target).toBeNull();
    expect(state.rounds).toBe(1);
  });

  it('ignores events that do not fit the phase', () => {
    const listening = run([{ type: 'start' }]);
    expect(reduce(listening, { type: 'midi-note', midi: 60 })).toEqual(listening);
    expect(reduce(listening, { type: 'next' })).toEqual(listening);
    expect(reduce(INITIAL_STATE, { type: 'pitch-accepted', midi: 60 })).toEqual(INITIAL_STATE);
  });

  it('returns to setup on stop and keeps the stats', () => {
    const played = run([
      { type: 'start' },
      { type: 'pitch-accepted', midi: 60 },
      { type: 'midi-note', midi: 60 },
    ]);
    const stopped = reduce(played, { type: 'stop' });
    expect(stopped.phase).toBe('setup');
    expect(stopped.target).toBeNull();
    expect(stopped.rounds).toBe(1);
  });
});

describe('accuracy', () => {
  it('is zero before the first round', () => {
    expect(accuracy(INITIAL_STATE)).toBe(0);
  });

  it('rounds to a whole percentage', () => {
    expect(accuracy({ ...INITIAL_STATE, rounds: 12, firstTryCorrect: 9 })).toBe(75);
    expect(accuracy({ ...INITIAL_STATE, rounds: 3, firstTryCorrect: 2 })).toBe(67);
  });
});
