Here’s the lean English version.

# MVP Spec – Sing → Read → Play

## Goal

A browser-based sight-reading trainer:

**Sing a note → see it in notation → play it on a USB MIDI keyboard → get instant feedback.**

The MVP should validate that this loop is technically reliable and useful for practice.

## Platform

Desktop web app, Chrome first.

Requirements:

* Microphone
* USB MIDI keyboard
* Web MIDI support

No backend required.

## Core Flow

1. User selects a clef.
2. User presses **Start**.
3. App shows: **Sing a note**.
4. App detects a stable sung pitch.
5. App converts it to the nearest MIDI note.
6. App displays that note on a staff.
7. App shows: **Play this note**.
8. User presses a MIDI key.
9. App compares the played MIDI note with the target.
10. Feedback:

* correct → **✓ Correct**, then next round
* incorrect → **✗ Try again**, keep waiting for the correct key

## Clefs

Required:

* Treble
* Bass

Optional:

* Alto
* Tenor

## Pitch Detection

Input: microphone audio.

Output:

```text
frequency: 440 Hz
note: A4
midi: 69
```

Use A4 = 440 Hz.

Conversion:

```text
midi = round(69 + 12 * log2(frequency / 440))
```

Accept a note only when:

* signal level is sufficient
* pitch confidence is sufficient
* the same MIDI note is stable for ~300 ms

Accepted range:

**E2–C5 / MIDI 40–72**

The range covers bass, baritone and tenor voices.

Ignore pitches outside this range.

## MIDI

Use Web MIDI API.

Listen for:

* Note On
* velocity > 0

Compare the exact MIDI note.

Example:

```text
Target: C4 / MIDI 60

C4 → correct
C3 → incorrect
D4 → incorrect
```

The octave must match.

## Notation

Display:

* one staff
* selected clef
* one note
* ledger lines when needed

Use a quarter note visually.

No rhythm, measures, time signatures, or key signatures.

For chromatic notes, use sharps only:

```text
C C# D D# E F F# G G# A A# B
```

## Note Names

The name of the target note stays hidden while the user reads the staff.
A hidden name keeps the reading exercise intact.

Show the name when the round ends.

The setting **Always show note names** shows the name in every phase. It helps a
beginner learn the staff positions.

## UI States

```text
SETUP
→ LISTENING
→ WAITING_FOR_MIDI
→ CORRECT / INCORRECT
→ LISTENING
```

### SETUP

Show:

* microphone status
* MIDI status
* clef selector
* Start button

### LISTENING

Show:

**Sing a note**

### WAITING_FOR_MIDI

Show the detected note and:

**Play this note**

### INCORRECT

Show:

**✗ Try again**

Remain in the same round.

### CORRECT

Show:

**✓ Correct**

After ~1 second, start the next round.

## Session Stats

Show only:

```text
Rounds: 12
First-try correct: 9
Accuracy: 75%
```

No persistence required.

Reload may reset the session.

## Edge Cases

### No microphone permission

Show:

**Microphone access required**

### No MIDI device

Show:

**Connect a MIDI keyboard**

Detect devices connected after page load.

### Unclear pitch

Stay in listening mode.

Do not react to short noise or speech.

### Out-of-range pitch

Show:

**Sing a note between E2 and C5**

## Suggested Stack

* React
* TypeScript
* Vite
* Web Audio API
* YIN, McLeod, or autocorrelation for pitch detection
* Web MIDI API
* VexFlow for notation

Everything runs client-side.

## Out of Scope

Do not build:

* accounts
* backend
* cloud sync
* native mobile apps
* chords
* intervals
* melodies
* rhythm training
* playback
* leaderboards
* learning plans
* advanced statistics
* alternate tunings
* key signatures
* transposing instruments

## Success Criteria

The MVP is done when this works reliably:

1. Open app in Chrome.
2. Allow microphone access.
3. Connect MIDI keyboard.
4. Select treble or bass clef.
5. Press Start.
6. Sing C4.
7. App displays C4 in notation.
8. Press D4 → **Incorrect**.
9. Press C4 → **Correct**.
10. App automatically starts the next round.

Target latency:

* pitch accepted within ~500 ms after stabilization
* MIDI feedback feels immediate, ideally <100 ms

