import { useCallback, useRef, useState } from 'react';
import {
  ScalableShape,
  ScaledShape,
  scaleShapeByGridSteps,
  scaleStepsFromDrag,
} from '@/lib/utils/scaleItem';

interface ScaleDrag {
  itemId: string;
  startClientY: number;
  base: ScalableShape;
}

interface UseScaleDragParams {
  zoom: number;
  gridSize: number;
  onItemScale: (
    itemId: string,
    scaled: ScaledShape,
    isScaling: boolean,
  ) => void;
}

/**
 * Owns a scale-mode drag. Each move rescales from the shape captured at
 * mousedown (so steps never compound) and previews without history; release
 * commits the last previewed shape as one undoable change.
 */
export function useScaleDrag({
  zoom,
  gridSize,
  onItemScale,
}: UseScaleDragParams) {
  const [drag, setDrag] = useState<ScaleDrag | null>(null);
  const lastScaledRef = useRef<ScaledShape | null>(null);

  const beginScale = useCallback(
    (e: { clientY: number }, itemId: string, base: ScalableShape) => {
      lastScaledRef.current = null;
      setDrag({ itemId, startClientY: e.clientY, base });
    },
    [],
  );

  const updateScale = useCallback(
    (e: { clientY: number }) => {
      if (!drag) return;
      const steps = scaleStepsFromDrag(
        drag.startClientY,
        e.clientY,
        zoom,
        gridSize,
      );
      const scaled = scaleShapeByGridSteps(drag.base, steps, gridSize);
      // Back at zero steps the preview is the original shape: nothing to commit
      lastScaledRef.current = steps === 0 ? null : scaled;
      onItemScale(drag.itemId, scaled, true);
    },
    [drag, zoom, gridSize, onItemScale],
  );

  const endScale = useCallback(() => {
    if (drag && lastScaledRef.current) {
      onItemScale(drag.itemId, lastScaledRef.current, false);
    }
    lastScaledRef.current = null;
    setDrag(null);
  }, [drag, onItemScale]);

  return { isScaling: drag !== null, beginScale, updateScale, endScale };
}
