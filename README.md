# Sing → Read → Play

A browser sight-reading trainer. You sing a note. The app shows the note on a staff. You play the
note on a USB MIDI keyboard. The app tells you if the note is correct.

The app runs fully in the browser. There is no backend.

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
Press **Start** and sing a note between C3 and C5.

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

## Specification

See [SPECS.md](SPECS.md).

## License

[MIT](LICENSE)
