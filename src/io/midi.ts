/** Web MIDI input. The app reacts to note-on messages only. */

export type MidiStatus = 'unsupported' | 'denied' | 'no-device' | 'ready';

export interface MidiOptions {
  /** Called for every note-on message with a velocity above zero. */
  onNoteOn: (midi: number) => void;
  /** Called on the first status and on every device change. */
  onStatus: (status: MidiStatus, deviceName?: string) => void;
}

const NOTE_ON = 0x90;
const STATUS_MASK = 0xf0;

/**
 * Connects to every MIDI input and follows devices connected after page load.
 * Returns a function that disconnects the listeners.
 */
export async function initMidi({ onNoteOn, onStatus }: MidiOptions): Promise<() => void> {
  if (!navigator.requestMIDIAccess) {
    onStatus('unsupported');
    return () => {};
  }

  let access: MIDIAccess;
  try {
    access = await navigator.requestMIDIAccess({ sysex: false });
  } catch {
    onStatus('denied');
    return () => {};
  }

  const handleMessage = (event: MIDIMessageEvent): void => {
    const data = event.data;
    if (!data || data.length < 3) return;
    const [status, note, velocity] = data as unknown as [number, number, number];
    if ((status & STATUS_MASK) !== NOTE_ON || velocity === 0) return;
    onNoteOn(note);
  };

  const connect = (): void => {
    const inputs = [...access.inputs.values()];
    for (const input of inputs) input.onmidimessage = handleMessage;
    const first = inputs[0];
    onStatus(first ? 'ready' : 'no-device', first?.name ?? undefined);
  };

  access.onstatechange = connect;
  connect();

  return () => {
    access.onstatechange = null;
    for (const input of access.inputs.values()) input.onmidimessage = null;
  };
}
