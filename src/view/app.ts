import { frequencyToMidi, MAX_MIDI, MIN_MIDI, midiToNoteName } from '../engine/music.js';
import {
  accuracy,
  INITIAL_STATE,
  type RoundEvent,
  type RoundState,
  reduce,
  showsTargetName,
} from '../engine/round.js';
import { createStabilityTracker, type PitchSample, type Rejection } from '../engine/stability.js';
import {
  type Microphone,
  MicrophoneError,
  microphonePermission,
  startMicrophone,
} from '../io/mic.js';
import { initMidi, type MidiStatus } from '../io/midi.js';
import { type Clef, createStaffView, isClef } from './staff.js';

const NEXT_ROUND_DELAY_MS = 1000;

interface Elements {
  micStatus: HTMLElement;
  midiStatus: HTMLElement;
  clef: HTMLSelectElement;
  alwaysNames: HTMLInputElement;
  start: HTMLButtonElement;
  prompt: HTMLElement;
  staff: HTMLDivElement;
  noteName: HTMLElement;
  feedback: HTMLElement;
  detector: HTMLElement;
  rounds: HTMLElement;
  firstTry: HTMLElement;
  accuracy: HTMLElement;
}

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`missing element: ${selector}`);
  return found;
}

const MIDI_MESSAGES: Record<MidiStatus, string> = {
  unsupported: 'Web MIDI not supported',
  denied: 'MIDI access required',
  'no-device': 'Connect a MIDI keyboard',
  ready: 'ready',
};

const REJECTION_MESSAGES: Partial<Record<NonNullable<Rejection>, string>> = {
  'out-of-range': `Sing a note between ${midiToNoteName(MIN_MIDI)} and ${midiToNoteName(MAX_MIDI)}`,
};

/** Wires the engine, the browser adapters and the DOM. */
export function createApp() {
  const ui: Elements = {
    micStatus: element('#mic-status'),
    midiStatus: element('#midi-status'),
    clef: element<HTMLSelectElement>('#clef'),
    alwaysNames: element<HTMLInputElement>('#always-names'),
    start: element<HTMLButtonElement>('#start'),
    prompt: element('#prompt'),
    staff: element<HTMLDivElement>('#staff'),
    noteName: element('#note-name'),
    feedback: element('#feedback'),
    detector: element('#detector'),
    rounds: element('#rounds'),
    firstTry: element('#first-try'),
    accuracy: element('#accuracy'),
  };

  const staff = createStaffView(ui.staff);
  const tracker = createStabilityTracker();

  let state: RoundState = INITIAL_STATE;
  let clef: Clef = isClef(ui.clef.value) ? ui.clef.value : 'treble';
  let microphone: Microphone | null = null;
  let starting = false;
  let midiReady = false;
  let hint = '';
  let nextRoundTimer = 0;
  let detectorShownMs = 0;

  function render(): void {
    ui.start.disabled = state.phase !== 'setup';

    switch (state.phase) {
      case 'setup':
        ui.prompt.textContent = 'Press Start.';
        break;
      case 'listening':
        ui.prompt.textContent = hint || 'Sing a note';
        break;
      default:
        ui.prompt.textContent = 'Play this note';
        break;
    }

    if (state.phase === 'correct') {
      ui.feedback.textContent = '✓ Correct';
      ui.feedback.dataset.state = 'correct';
    } else if (state.phase === 'incorrect') {
      const played =
        state.lastPlayed === null ? '' : ` (you played ${midiToNoteName(state.lastPlayed)})`;
      ui.feedback.textContent = `✗ Try again${played}`;
      ui.feedback.dataset.state = 'incorrect';
    } else {
      ui.feedback.textContent = '';
      delete ui.feedback.dataset.state;
    }

    ui.noteName.textContent = targetName();
    staff.render(clef, state.target);

    ui.rounds.textContent = String(state.rounds);
    ui.firstTry.textContent = String(state.firstTryCorrect);
    ui.accuracy.textContent = String(accuracy(state));
  }

  /**
   * Returns the name of the target note. The name stays hidden until the round
   * ends, because the name would answer the exercise. A wrong key does not
   * reveal it. The setting "Always show note names" shows it in every phase.
   */
  function targetName(): string {
    if (state.target === null) return '';
    if (!showsTargetName(state.phase, ui.alwaysNames.checked)) return '';
    return midiToNoteName(state.target);
  }

  function dispatch(event: RoundEvent): void {
    const next = reduce(state, event);
    if (next === state) return;
    state = next;

    if (state.phase === 'waiting') {
      hint = '';
      tracker.reset();
    }
    microphone?.setActive(state.phase === 'listening');
    if (state.phase === 'correct') {
      window.clearTimeout(nextRoundTimer);
      nextRoundTimer = window.setTimeout(() => dispatch({ type: 'next' }), NEXT_ROUND_DELAY_MS);
    }
    render();
  }

  /**
   * Shows the raw detector output in development builds. Use it to pick the
   * clarity and level thresholds for a voice.
   */
  function showDetector(sample: PitchSample): void {
    if (!import.meta.env.DEV) return;
    if (sample.timeMs - detectorShownMs < 100) return;
    detectorShownMs = sample.timeMs;
    const hz = sample.frequency === null ? '   --  ' : sample.frequency.toFixed(1).padStart(7);
    const midi =
      sample.frequency === null ? '--' : midiToNoteName(frequencyToMidi(sample.frequency));
    ui.detector.hidden = false;
    ui.detector.textContent = `${hz} Hz  ${midi.padEnd(4)}  clarity ${sample.clarity.toFixed(2)}  rms ${sample.rms.toFixed(3)}`;
  }

  function setStatus(target: HTMLElement, text: string, ok: boolean): void {
    target.textContent = text;
    target.dataset.state = ok ? 'ready' : 'error';
  }

  async function start(): Promise<void> {
    if (starting || microphone) return;
    starting = true;
    ui.start.disabled = true;
    try {
      microphone = await startMicrophone((sample) => {
        showDetector(sample);
        if (state.phase !== 'listening') return;
        const midi = tracker.push(sample);
        if (midi !== null) {
          dispatch({ type: 'pitch-accepted', midi });
          return;
        }
        const message = REJECTION_MESSAGES[tracker.rejection() ?? 'silent'] ?? '';
        if (message !== hint) {
          hint = message;
          render();
        }
      });
      setStatus(ui.micStatus, 'ready', true);
      dispatch({ type: 'start' });
    } catch (error) {
      const message =
        error instanceof MicrophoneError ? error.message : 'Microphone access required';
      setStatus(ui.micStatus, message, false);
    }
  }

  ui.start.addEventListener('click', () => {
    void start();
  });

  ui.alwaysNames.addEventListener('change', render);

  ui.clef.addEventListener('change', () => {
    if (isClef(ui.clef.value)) clef = ui.clef.value;
    render();
  });

  void microphonePermission().then((permission) => {
    if (state.phase !== 'setup' || microphone) return;
    if (permission === 'granted') setStatus(ui.micStatus, 'ready', true);
    else if (permission === 'denied') setStatus(ui.micStatus, 'Microphone access required', false);
    else setStatus(ui.micStatus, 'allowed on Start', true);
  });

  void initMidi({
    onNoteOn: (midi) => dispatch({ type: 'midi-note', midi }),
    onStatus: (status, deviceName) => {
      midiReady = status === 'ready';
      setStatus(
        ui.midiStatus,
        midiReady ? (deviceName ?? 'ready') : MIDI_MESSAGES[status],
        midiReady,
      );
    },
  });

  render();

  return {
    /** Test hook: enters the listening phase without the microphone. */
    start: () => dispatch({ type: 'start' }),
    /** Test hook: feeds an accepted sung note. */
    pitch: (midi: number) => dispatch({ type: 'pitch-accepted', midi }),
    /** Test hook: feeds a played key. */
    key: (midi: number) => dispatch({ type: 'midi-note', midi }),
    /** Test hook: reads the current state. */
    state: () => state,
  };
}
