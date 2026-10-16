import React, { RefObject, useCallback, useEffect } from 'react';
import { EditorMode, Furniture, ResizeWall, Room } from '@/lib/types';
import {
  ItemMoveHandler,
  ItemResizeHandler,
  useItemDragResize,
} from '@/lib/hooks/useItemDragResize';
import { useRuler } from '@/lib/hooks/useRuler';
import { useScaleDrag } from '@/lib/hooks/useScaleDrag';
import { ScaledShape } from '@/lib/utils/scaleItem';

interface UseEditorPointerGesturesParams {
  rooms: Room[];
  furniture: Furniture[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string | null) => void;
  onItemMove: ItemMoveHandler;
  onItemResize: ItemResizeHandler;
  onItemScale: (
    itemId: string,
    scaled: ScaledShape,
    isScaling: boolean,
  ) => void;
  editorMode: EditorMode;
  gridSize: number;
  zoom: number;
  contentRef: RefObject<HTMLDivElement | null>;
}

/**
 * Owns LayoutEditor pointer-gesture routing: ruler, scale, move, resize and
 * pan. Composes useRuler, useScaleDrag and useItemDragResize, and attaches the
 * single window move/up listener so gestures keep tracking off-canvas.
 */
export function useEditorPointerGestures({
  rooms,
  furniture,
  selectedItemId,
  onItemSelect,
  onItemMove,
  onItemResize,
  onItemScale,
  editorMode,
  gridSize,
  zoom,
  contentRef,
}: UseEditorPointerGesturesParams) {
  const {
    start: rulerStart,
    end: rulerEnd,
    isRuling,
    distance: rulerDistance,
    beginRuler,
    updateRuler,
    endRuler,
    clearRuler,
  } = useRuler({ zoom, gridSize, contentRef });

  const { isScaling, beginScale, updateScale, endScale } = useScaleDrag({
    zoom,
    gridSize,
    onItemScale,
  });

  /** Alt+drag always measures; ruler mode measures on a plain left-drag. */
  const shouldStartRuler = useCallback(
    (e: React.MouseEvent) =>
      e.altKey || (editorMode === 'ruler' && e.button === 0),
    [editorMode],
  );

  const findItem = useCallback(
    (itemId: string): Room | Furniture | undefined =>
      rooms.find((room) => room.id === itemId) ??
      furniture.find((item) => item.id === itemId),
    [rooms, furniture],
  );

  const {
    isDragging,
    isPanning,
    isResizing,
    viewportOffset,
    beginMove,
    beginPan,
    beginResize,
    updateDrag,
    endDrag,
  } = useItemDragResize({
    zoom,
    gridSize,
    selectedItemId,
    findItem,
    onItemMove,
    onItemResize,
  });

  const handleItemMouseDown = useCallback(
    (e: React.MouseEvent, roomId: string) => {
      // Measure over an item without moving it
      if (shouldStartRuler(e)) {
        beginRuler(e);
        e.stopPropagation();
        return;
      }
      if (editorMode === 'scale' && e.button === 0) {
        const item = findItem(roomId);
        if (item) {
          clearRuler();
          onItemSelect(roomId);
          beginScale(e, roomId, item);
        }
        e.stopPropagation();
        return;
      }
      // Only handle room dragging if not panning and not holding space
      if (!isPanning && !e.shiftKey) {
        clearRuler();
        beginMove(e);
        onItemSelect(roomId);
        e.stopPropagation(); // Prevent event from bubbling up to container
      }
    },
    [
      onItemSelect,
      isPanning,
      shouldStartRuler,
      beginRuler,
      clearRuler,
      editorMode,
      findItem,
      beginScale,
      beginMove,
    ],
  );

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Start a ruler measurement anywhere on the canvas
      if (shouldStartRuler(e)) {
        beginRuler(e);
        return;
      }
      // Start panning if holding shift or right mouse button
      if (e.shiftKey || e.button === 2) {
        e.preventDefault();
        clearRuler();
        beginPan(e);
      } else {
        // Clear selection and any measurement when clicking empty space
        clearRuler();
        onItemSelect(null);
      }
    },
    [onItemSelect, shouldStartRuler, beginRuler, clearRuler, beginPan],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, roomId: string, wall: ResizeWall) => {
      e.stopPropagation();
      beginResize(e, wall);
      onItemSelect(roomId);
    },
    [onItemSelect, beginResize],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isRuling) {
        updateRuler(e);
        return;
      }
      if (isScaling) {
        updateScale(e);
        return;
      }

      updateDrag(e);
    },
    [isRuling, updateRuler, isScaling, updateScale, updateDrag],
  );

  const handleMouseUp = useCallback(() => {
    if (isRuling) {
      // Keep the measurement on screen until the next interaction
      endRuler();
    }
    if (isScaling) {
      endScale();
    }
    endDrag();
  }, [isRuling, endRuler, isScaling, endScale, endDrag]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // The window is the only move/up listener, so a gesture keeps tracking off
  // the canvas and a canvas event is never handled twice.
  useEffect(() => {
    if (isDragging || isPanning || isResizing || isRuling || isScaling) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isPanning,
    isResizing,
    isRuling,
    isScaling,
    handleMouseMove,
    handleMouseUp,
  ]);

  return {
    rulerStart,
    rulerEnd,
    rulerDistance,
    isRuling,
    viewportOffset,
    handleItemMouseDown,
    handleContainerMouseDown,
    handleResizeStart,
    handleContextMenu,
  };
}
