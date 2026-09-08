/** The round state machine and the session stats. */

export type Phase = 'setup' | 'listening' | 'waiting' | 'correct' | 'incorrect';

export interface RoundState {
  phase: Phase;
  /** The MIDI note the user must play, or null outside a round. */
  target: number | null;
  /** Wrong keys played in the current round. */
  attempts: number;
  /** The last key the user played, or null. */
  lastPlayed: number | null;
  /** Rounds finished in this session. */
  rounds: number;
  /** Rounds finished without a wrong key. */
  firstTryCorrect: number;
}

export type RoundEvent =
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'pitch-accepted'; midi: number }
  | { type: 'midi-note'; midi: number }
  | { type: 'next' };

export const INITIAL_STATE: RoundState = {
  phase: 'setup',
  target: null,
  attempts: 0,
  lastPlayed: null,
  rounds: 0,
  firstTryCorrect: 0,
};

/** Applies one event. The function is pure and returns a new state. */
export function reduce(state: RoundState, event: RoundEvent): RoundState {
  switch (event.type) {
    case 'start':
      if (state.phase !== 'setup') return state;
      return { ...state, phase: 'listening', target: null, attempts: 0, lastPlayed: null };

    case 'stop':
      return { ...state, phase: 'setup', target: null, attempts: 0, lastPlayed: null };

    case 'pitch-accepted':
      if (state.phase !== 'listening') return state;
      return { ...state, phase: 'waiting', target: event.midi, attempts: 0, lastPlayed: null };

    case 'midi-note': {
      if (state.phase !== 'waiting' && state.phase !== 'incorrect') return state;
      if (state.target === null) return state;
      if (event.midi === state.target) {
        return {
          ...state,
          phase: 'correct',
          lastPlayed: event.midi,
          rounds: state.rounds + 1,
          firstTryCorrect: state.firstTryCorrect + (state.attempts === 0 ? 1 : 0),
        };
      }
      return {
        ...state,
        phase: 'incorrect',
        lastPlayed: event.midi,
        attempts: state.attempts + 1,
      };
    }

    case 'next':
      if (state.phase !== 'correct') return state;
      return { ...state, phase: 'listening', target: null, attempts: 0, lastPlayed: null };

    default:
      // Every event variant is handled above.
      event satisfies never;
      return state;
  }
}

/**
 * Reports if the app may show the name of the target note.
 *
 * The name stays hidden until the round ends, because a visible name answers
 * the reading exercise. A wrong key does not reveal it either. The setting
 * "Always show note names" shows the name in every phase.
 */
export function showsTargetName(phase: Phase, alwaysShow: boolean): boolean {
  return alwaysShow || phase === 'correct';
}

/** Returns the share of first-try correct rounds as a whole percentage. */
export function accuracy(state: RoundState): number {
  if (state.rounds === 0) return 0;
  return Math.round((state.firstTryCorrect / state.rounds) * 100);
}
