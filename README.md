# Sing → Read → Play

A browser sight-reading trainer. You sing a note. The app shows the note on a staff. You play the
note on a USB MIDI keyboard. The app tells you if the note is correct.

The app runs fully in the browser. There is no backend.

The app is live at <https://maehr.github.io/sing-read-play/>.

## Requirements

- Chrome on a desktop computer
- A microphone
- A USB MIDI keyboard

## Install

```sh
npm install
```

## Use

```sh
npm run dev
```

Open the printed URL. Allow microphone access. Connect the MIDI keyboard. Select a clef.
Press **Start** and sing a note between E2 and C5.

## Scripts

| Script              | Action                          |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the development server.   |
| `npm run build`     | Build the production files.     |
| `npm run preview`   | Serve the production files.     |
| `npm test`          | Run the unit tests.             |
| `npm run lint`      | Check format and lint rules.    |
| `npm run format`    | Apply format and lint fixes.    |
| `npm run typecheck` | Check the TypeScript types.     |

## Deploy

A push to `main` builds the app and publishes it to GitHub Pages.

## Specification

See [SPECS.md](SPECS.md).

## License

[AGPL-3.0-or-later](LICENSE)
