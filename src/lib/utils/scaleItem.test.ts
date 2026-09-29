import { scaleShapeByGridSteps, scaleStepsFromDrag } from './scaleItem';

describe('scaleStepsFromDrag', () => {
  test('dragging up grows, dragging down shrinks, in whole grid steps', () => {
    expect(scaleStepsFromDrag(100, 76, 1, 12)).toBe(2);
    expect(scaleStepsFromDrag(100, 124, 1, 12)).toBe(-2);
  });

  test('rounds partial steps and returns 0 (not -0) near the start', () => {
    expect(scaleStepsFromDrag(100, 95, 1, 12)).toBe(0);
    expect(scaleStepsFromDrag(100, 105, 1, 12)).toBe(0);
    expect(scaleStepsFromDrag(100, 93, 1, 12)).toBe(1);
  });

  test('converts client px to data inches through zoom', () => {
    // 24 client px at zoom 2 is 12 data inches: one step on a 12" grid
    expect(scaleStepsFromDrag(100, 76, 2, 12)).toBe(1);
  });
});

describe('scaleShapeByGridSteps', () => {
  const room = {
    x: 12,
    y: 24,
    width: 144,
    height: 120,
    points: [] as { x: number; y: number }[],
  };

  test('grows the larger dimension by exactly the step count', () => {
    const scaled = scaleShapeByGridSteps(room, 2, 12);
    expect(scaled.width).toBe(168);
    // 120 * (168/144) = 140, snapped to the 12" grid
    expect(scaled.height).toBe(144);
  });

  test('shrinks proportionally and keeps grid alignment', () => {
    const scaled = scaleShapeByGridSteps(room, -6, 12);
    expect(scaled.width).toBe(72);
    expect(scaled.height).toBe(60);
  });

  test('is a no-op at zero steps', () => {
    expect(scaleShapeByGridSteps(room, 0, 12)).toEqual({
      width: 144,
      height: 120,
      points: [],
    });
  });

  test('never shrinks a dimension below one grid unit', () => {
    const scaled = scaleShapeByGridSteps(room, -100, 12);
    expect(scaled.width).toBe(12);
    expect(scaled.height).toBe(12);
  });

  test('scales every point about the representative point, snapped to grid', () => {
    const withPoints = {
      ...room,
      points: [
        { x: 12, y: 24 },
        { x: 156, y: 24 },
        { x: 156, y: 144 },
        { x: 12, y: 144 },
      ],
    };
    const scaled = scaleShapeByGridSteps(withPoints, 12, 12);
    // factor 2: offsets double around (12, 24)
    expect(scaled.width).toBe(288);
    expect(scaled.height).toBe(240);
    expect(scaled.points).toEqual([
      { x: 12, y: 24 },
      { x: 300, y: 24 },
      { x: 300, y: 264 },
      { x: 12, y: 264 },
    ]);
  });

  test('leaves degenerate shapes untouched', () => {
    const empty = { ...room, width: 0, height: 0 };
    expect(scaleShapeByGridSteps(empty, 3, 12)).toEqual({
      width: 0,
      height: 0,
      points: [],
    });
  });
});
