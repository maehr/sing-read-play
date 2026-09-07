# AGENTS.md

Machine contract for `sing-read-play`. Read this file before you change code.

## Project

A browser sight-reading trainer. The user sings a note. The app shows the note on a staff. The user
plays the note on a USB MIDI keyboard. The app gives instant feedback.

`SPECS.md` is the product specification. Do not add features outside it.

## Stack

- Vite, TypeScript, vanilla DOM. No UI framework.
- Biome for format and lint.
- Vitest for unit tests.
- `pitchy` for pitch detection. `vexflow` for notation.
- No backend. All code runs in the browser.

## Layout

| Path          | Content                                                  |
| ------------- | -------------------------------------------------------- |
| `src/engine/` | Pure logic. No DOM and no browser API. Unit tested.       |
| `src/io/`     | Browser adapters for the microphone and Web MIDI.         |
| `src/view/`   | DOM and VexFlow rendering.                                |
| `src/main.ts` | Entry point. Wires the three layers.                      |

Keep browser APIs out of `src/engine/`. Put every testable rule in `src/engine/`.

## Commands

```sh
npm run dev        # development server
npm test           # unit tests
npm run lint       # format and lint check
npm run typecheck  # TypeScript check
npm run build      # production build
```

Run `npm run format` before you commit. Run `npm test` and `npm run typecheck` before you push.

## Rules

- Write conventional commits, for example `feat: add stability tracker`.
- Use semantic versioning. The version lives in `package.json`.
- Never push to `main`. Open a pull request with a conventional title. Squash merge it.
- Add a unit test for every new rule in `src/engine/`.
- Use A4 = 440 Hz. Spell chromatic notes with sharps only.
- The sung range is MIDI 48 to 72 (C3 to C5).
- Use the GNU AGPL-3.0 license. Never use a permissive license.
- Pin every GitHub Action to its latest major version.
