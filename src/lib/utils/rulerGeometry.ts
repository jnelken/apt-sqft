import { Point } from '@/lib/types';

/**
 * Pure geometry helpers for the ruler overlay. Kept DOM-independent so they can
 * be unit-tested without real element rects.
 *
 * Coordinate spaces:
 * - "client" px: viewport coordinates from a MouseEvent (clientX/clientY).
 * - "data" inches: the layout's internal unit (1 inch = 1em = 1px at zoom 1.0).
 * - "container" px: pixels relative to the editor container's top-left, used
 *   for drawing the overlay.
 */

/** Top-left origin of a DOMRect, in client px. */
export interface Origin {
  left: number;
  top: number;
}

/** Convert a cursor position (client px) to data inches within the content. */
export function clientToData(
  client: { clientX: number; clientY: number },
  contentOrigin: Origin,
  zoom: number,
): Point {
  return {
    x: (client.clientX - contentOrigin.left) / zoom,
    y: (client.clientY - contentOrigin.top) / zoom,
  };
}

/** Project a data-inch point back to container px for drawing. */
export function projectToContainer(
  dataPoint: Point,
  contentOrigin: Origin,
  containerOrigin: Origin,
  zoom: number,
): Point {
  return {
    x: contentOrigin.left - containerOrigin.left + dataPoint.x * zoom,
    y: contentOrigin.top - containerOrigin.top + dataPoint.y * zoom,
  };
}

/** Straight-line distance between two data points, in inches. */
export function distanceInches(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Snap a data point to the nearest grid intersection. */
export function snapPoint(p: Point, gridSize: number): Point {
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  };
}

/** Midpoint of two points (same space as inputs). */
export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}
