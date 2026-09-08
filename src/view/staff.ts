import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveConnector,
  StaveNote,
  Voice,
} from 'vexflow/bravura';
import { isSharp, midiToVexKey } from '../engine/music.js';
import { type Clef, clefsForNote, STAFF_SETS, type StaffSet } from '../engine/notation.js';

const WIDTH = 320;
const STAVE_X = 10;
const STAVE_WIDTH = 260;
const SINGLE_TOP = 60;
const SINGLE_HEIGHT = 200;
const GRAND_TOP = 40;
const GRAND_GAP = 120;
const GRAND_HEIGHT = 260;

export interface StaffView {
  /** Draws the staff set and, when given, one quarter note. */
  render(set: StaffSet, midi: number | null): void;
}

function drawNote(context: ReturnType<Renderer['getContext']>, stave: Stave, midi: number): void {
  const note = new StaveNote({
    clef: stave.getClef(),
    keys: [midiToVexKey(midi)],
    duration: 'q',
  });
  if (isSharp(midi)) note.addModifier(new Accidental('#'), 0);

  const voice = new Voice({ numBeats: 1, beatValue: 4 }).addTickables([note]);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.setContext(context).setStave(stave).draw();
}

/** Creates a VexFlow staff view. It draws one note in one or more clefs. */
export function createStaffView(container: HTMLDivElement): StaffView {
  let last: { set: StaffSet; midi: number | null } | null = null;

  const view: StaffView = {
    render(set, midi) {
      last = { set, midi };
      container.replaceChildren();

      const clefs = STAFF_SETS[set];
      const grand = clefs.length > 1;

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(WIDTH, grand ? GRAND_HEIGHT : SINGLE_HEIGHT);
      const context = renderer.getContext();

      const staves = new Map<Clef, Stave>();
      clefs.forEach((clef, index) => {
        const top = grand ? GRAND_TOP + index * GRAND_GAP : SINGLE_TOP;
        const stave = new Stave(STAVE_X, top, STAVE_WIDTH);
        stave.addClef(clef).setContext(context).draw();
        staves.set(clef, stave);
      });

      const [first, second] = [...staves.values()];
      if (first && second) {
        // A bracket, not a brace: VexFlow draws the brace glyph in two halves
        // that do not meet at this staff distance.
        for (const type of ['bracket', 'singleLeft'] as const) {
          new StaveConnector(first, second).setType(type).setContext(context).draw();
        }
      }

      if (midi === null) return;
      for (const clef of clefsForNote(clefs, midi)) {
        const stave = staves.get(clef);
        if (stave) drawNote(context, stave, midi);
      }
    },
  };

  // The music font loads asynchronously. Draw again once the metrics are right.
  if (document.fonts) {
    void document.fonts.ready.then(() => {
      if (last) view.render(last.set, last.midi);
    });
  }

  return view;
}
