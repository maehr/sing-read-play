import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import { isSharp, midiToVexKey } from '../engine/music.js';

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor';

export const CLEFS: readonly Clef[] = ['treble', 'bass', 'alto', 'tenor'];

const WIDTH = 320;
const HEIGHT = 200;
const STAVE_TOP = 60;
const STAVE_WIDTH = 260;

export interface StaffView {
  /** Draws the clef and, when given, one quarter note. */
  render(clef: Clef, midi: number | null): void;
}

/** Reports if the value names a clef the app supports. */
export function isClef(value: string): value is Clef {
  return (CLEFS as readonly string[]).includes(value);
}

/** Creates a VexFlow staff that draws one clef and one note. */
export function createStaffView(container: HTMLDivElement): StaffView {
  return {
    render(clef, midi) {
      container.replaceChildren();

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(WIDTH, HEIGHT);
      const context = renderer.getContext();

      const stave = new Stave(10, STAVE_TOP, STAVE_WIDTH);
      stave.addClef(clef).setContext(context).draw();

      if (midi === null) return;

      const note = new StaveNote({ clef, keys: [midiToVexKey(midi)], duration: 'q' });
      if (isSharp(midi)) note.addModifier(new Accidental('#'), 0);

      const voice = new Voice({ numBeats: 1, beatValue: 4 }).addTickables([note]);
      new Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.setContext(context).setStave(stave).draw();
    },
  };
}
