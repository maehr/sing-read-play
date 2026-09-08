import { describe, expect, it } from 'vitest';
import { clefsForNote, diatonicStep, isStaffSet, ledgerLines, STAFF_SETS } from './notation.js';

describe('diatonicStep', () => {
  it('gives one step per letter', () => {
    expect(diatonicStep(60)).toBe(28); // C4
    expect(diatonicStep(62)).toBe(29); // D4
    expect(diatonicStep(72)).toBe(35); // C5
  });

  it('gives a sharp the step of its letter', () => {
    expect(diatonicStep(61)).toBe(diatonicStep(60)); // C#4 and C4
  });
});

describe('ledgerLines', () => {
  it('needs none inside the staff', () => {
    expect(ledgerLines('treble', 64)).toBe(0); // E4 on the bottom line
    expect(ledgerLines('treble', 77)).toBe(0); // F5 on the top line
    expect(ledgerLines('bass', 43)).toBe(0); // G2 on the bottom line
    expect(ledgerLines('bass', 57)).toBe(0); // A3 on the top line
  });

  it('gives middle C one ledger line in both clefs', () => {
    expect(ledgerLines('treble', 60)).toBe(1);
    expect(ledgerLines('bass', 60)).toBe(1);
  });

  it('counts the lines of a far note', () => {
    expect(ledgerLines('treble', 40)).toBe(7); // E2 below the treble staff
    expect(ledgerLines('bass', 40)).toBe(1); // E2 below the bass staff
    expect(ledgerLines('bass', 72)).toBe(4); // C5 above the bass staff
    expect(ledgerLines('bass', 64)).toBe(2); // E4 above the bass staff
  });

  it('counts alto and tenor clefs', () => {
    expect(ledgerLines('alto', 60)).toBe(0); // C4 on the middle line
    expect(ledgerLines('tenor', 60)).toBe(0); // C4 inside the staff
  });
});

describe('clefsForNote', () => {
  const grand = STAFF_SETS.grand;

  it('shows a middle note in both clefs', () => {
    expect(clefsForNote(grand, 60)).toEqual(['treble', 'bass']); // C4
    expect(clefsForNote(grand, 64)).toEqual(['treble', 'bass']); // E4
    expect(clefsForNote(grand, 55)).toEqual(['treble', 'bass']); // G3
  });

  it('keeps a low note on the bass staff only', () => {
    expect(clefsForNote(grand, 40)).toEqual(['bass']); // E2
    expect(clefsForNote(grand, 48)).toEqual(['bass']); // C3
  });

  it('keeps a high note on the treble staff only', () => {
    expect(clefsForNote(grand, 72)).toEqual(['treble']); // C5
  });

  it('keeps a single-clef set even when the note sits far outside', () => {
    expect(clefsForNote(['treble'], 40)).toEqual(['treble']);
  });
});

describe('isStaffSet', () => {
  it('accepts the known sets', () => {
    expect(isStaffSet('grand')).toBe(true);
    expect(isStaffSet('bass')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isStaffSet('soprano')).toBe(false);
  });

  it('rejects inherited keys', () => {
    expect(isStaffSet('toString')).toBe(false);
    expect(isStaffSet('__proto__')).toBe(false);
  });
});
