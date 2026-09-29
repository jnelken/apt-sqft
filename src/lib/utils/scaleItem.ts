import { Point } from '@/lib/types';

/** The geometry of a room or furniture item that scale mode rewrites. */
export interface ScalableShape {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
}

export type ScaledShape = Pick<ScalableShape, 'width' | 'height' | 'points'>;

const snap = (value: number, gridSize: number) =>
  Math.round(value / gridSize) * gridSize;

/**
 * Whole grid steps for a vertical scale drag. Dragging up is positive (grow),
 * dragging down is negative (shrink). Client px are converted to data inches
 * through the zoom factor.
 */
export function scaleStepsFromDrag(
  startClientY: number,
  currentClientY: number,
  zoom: number,
  gridSize: number,
): number {
  const steps = Math.round((startClientY - currentClientY) / zoom / gridSize);
  return steps === 0 ? 0 : steps;
}

/**
 * Uniformly scale a shape about its representative point (x, y). The larger
 * dimension changes by exactly `steps` grid units; the other follows
 * proportionally. Every dimension and point offset snaps to the grid, and no
 * dimension shrinks below one grid unit.
 */
export function scaleShapeByGridSteps(
  shape: ScalableShape,
  steps: number,
  gridSize: number,
): ScaledShape {
  const base = Math.max(shape.width, shape.height);
  if (base <= 0 || gridSize <= 0) {
    return { width: shape.width, height: shape.height, points: shape.points };
  }

  const factor = Math.max(gridSize, base + steps * gridSize) / base;
  const scaleOffset = (offset: number) => snap(offset * factor, gridSize);

  return {
    width: Math.max(gridSize, scaleOffset(shape.width)),
    height: Math.max(gridSize, scaleOffset(shape.height)),
    points: shape.points.map((point) => ({
      x: shape.x + scaleOffset(point.x - shape.x),
      y: shape.y + scaleOffset(point.y - shape.y),
    })),
  };
}
