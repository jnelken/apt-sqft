import { feetInchesLabel, inchesLabel } from './formatLength';

describe('feetInchesLabel', () => {
  test('zero', () => {
    expect(feetInchesLabel(0)).toBe(`0' 0"`);
  });

  test('sub-foot length', () => {
    expect(feetInchesLabel(8)).toBe(`0' 8"`);
  });

  test('exact feet', () => {
    expect(feetInchesLabel(24)).toBe(`2' 0"`);
  });

  test('feet and inches', () => {
    expect(feetInchesLabel(63)).toBe(`5' 3"`);
  });

  test('rounds to the nearest inch before splitting', () => {
    expect(feetInchesLabel(62.7)).toBe(`5' 3"`);
    expect(feetInchesLabel(11.6)).toBe(`1' 0"`);
  });
});

describe('inchesLabel', () => {
  test('rounds to the nearest inch', () => {
    expect(inchesLabel(63)).toBe(`63"`);
    expect(inchesLabel(62.7)).toBe(`63"`);
    expect(inchesLabel(0)).toBe(`0"`);
  });
});
