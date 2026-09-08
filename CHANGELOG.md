# Changelog

All notable changes to this project appear in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- The app now accepts sung notes from E2 to C5. The old floor of C3 rejected the
  lower half of a bass or baritone range. The analysis frame grew to 4096 samples,
  because a low voice needs a longer frame for a stable result. ([#6])

### Added

- A grand staff. It draws the same note in the treble and the bass clef at once.
  A staff drops the note when the note needs more than two ledger lines there.
  The clef selector becomes a staff selector. ([#10])
- The name of the target note appears when the round ends. A setting shows the
  name in every phase. ([#9])
- A detector readout in development builds. It shows the frequency, the note, the
  clarity and the level. Use it to pick thresholds for a voice. ([#6])

## [0.1.0] - 2026-09-07

### Added

- Sing a note, read it on a staff, play it on a USB MIDI keyboard, get instant feedback.
- Pitch detection from the microphone with the McLeod method.
- Web MIDI input with device hot-plug.
- Notation with VexFlow for treble, bass, alto and tenor clefs.
- Session stats: rounds, first-try correct and accuracy.
- Automatic deployment to GitHub Pages.

[unreleased]: https://github.com/maehr/sing-read-play/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/maehr/sing-read-play/releases/tag/v0.1.0
[#6]: https://github.com/maehr/sing-read-play/issues/6
[#9]: https://github.com/maehr/sing-read-play/issues/9
[#10]: https://github.com/maehr/sing-read-play/issues/10
