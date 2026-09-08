# Roadmap

This file states what the app does today and what comes next. The issue tracker holds the detail.

## Done

### v0.1.1

- The sung range covers bass and baritone voices, from E2 to C5. ([#6])
- The name of the target note appears when the round ends. ([#9])
- A grand staff shows the same note in the treble and the bass clef. ([#10])

### v0.1.0

The first working loop: sing a note, read it on a staff, play it on a MIDI keyboard, get feedback.

## Next

### v0.2.0 — Review what you sang

- Keep a history of the notes of the session. ([#7])

### v0.3.0 — See the keyboard

- Draw a piano keyboard. Show the key the user holds. ([#8])

The keyboard needs note-off messages. The MIDI adapter passes on note-on only today.

## Later

No dates. These ideas need a real practice session first.

- Tune the detector thresholds for a low voice. The dev readout shows the numbers.
- Keep the session across a reload.
- Choose a voice type, which sets the range.

## Not planned

The `Out of Scope` list in [SPECS.md](SPECS.md) stays out of scope. It holds accounts, a backend,
chords, intervals, melodies, rhythm training and key signatures.

## Version rule

The project follows semantic versioning. A feature raises the minor number. A fix raises the patch
number. Version 1.0.0 waits until the acceptance test in [SPECS.md](SPECS.md) holds in a real
practice session.

[#6]: https://github.com/maehr/sing-read-play/issues/6
[#7]: https://github.com/maehr/sing-read-play/issues/7
[#8]: https://github.com/maehr/sing-read-play/issues/8
[#9]: https://github.com/maehr/sing-read-play/issues/9
[#10]: https://github.com/maehr/sing-read-play/issues/10
