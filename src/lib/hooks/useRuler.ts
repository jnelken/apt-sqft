import { RefObject, useCallback, useMemo, useState } from 'react';
import { Point } from '@/lib/types';
import {
  clientToData,
  distanceInches,
  snapPoint,
} from '@/lib/utils/rulerGeometry';

/** A mouse-like event carrying the fields the ruler needs. */
interface RulerPointer {
  clientX: number;
  clientY: number;
  shiftKey: boolean;
}

interface UseRulerParams {
  zoom: number;
  gridSize: number;
  contentRef: RefObject<HTMLDivElement | null>;
}

/**
 * Owns ruler measurement state. Endpoints are stored in data inches so they
 * stay anchored to the layout across pan/zoom. Holding Shift while measuring
 * snaps endpoints to the grid.
 */
export function useRuler({ zoom, gridSize, contentRef }: UseRulerParams) {
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [isRuling, setIsRuling] = useState(false);

  const toDataPoint = useCallback(
    (e: RulerPointer): Point | null => {
      const content = contentRef.current;
      if (!content) return null;
      const rect = content.getBoundingClientRect();
      const point = clientToData(e, rect, zoom);
      return e.shiftKey ? snapPoint(point, gridSize) : point;
    },
    [contentRef, zoom, gridSize],
  );

  const beginRuler = useCallback(
    (e: RulerPointer) => {
      const point = toDataPoint(e);
      if (!point) return;
      setStart(point);
      setEnd(point);
      setIsRuling(true);
    },
    [toDataPoint],
  );

  const updateRuler = useCallback(
    (e: RulerPointer) => {
      const point = toDataPoint(e);
      if (!point) return;
      setEnd(point);
    },
    [toDataPoint],
  );

  const endRuler = useCallback(() => {
    setIsRuling(false);
  }, []);

  const clearRuler = useCallback(() => {
    setStart(null);
    setEnd(null);
    setIsRuling(false);
  }, []);

  const distance = useMemo(
    () => (start && end ? distanceInches(start, end) : null),
    [start, end],
  );

  return {
    start,
    end,
    isRuling,
    distance,
    beginRuler,
    updateRuler,
    endRuler,
    clearRuler,
  };
}
