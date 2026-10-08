'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { EditorMode, Room, Furniture, ResizeWall } from '@/lib/types';
import {
  ItemMoveHandler,
  ItemResizeHandler,
  useItemDragResize,
} from '@/lib/hooks/useItemDragResize';
import { useRuler } from '@/lib/hooks/useRuler';
import { useScaleDrag } from '@/lib/hooks/useScaleDrag';
import { ScaledShape } from '@/lib/utils/scaleItem';
import { RulerOverlay } from './ui/RulerOverlay';
import { LayoutEditorItem } from './LayoutEditorItem';
import {
  BackgroundImage,
  EditorContainer,
  EditorContent,
  Grid,
  MODE_CURSORS,
} from './LayoutEditorCanvas';

interface LayoutEditorProps {
  rooms: Room[];
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomMove: ItemMoveHandler;
  onRoomResize: ItemResizeHandler;
  onRoomScale: (
    roomId: string,
    scaled: ScaledShape,
    isScaling: boolean,
  ) => void;
  editorMode: EditorMode;
  gridSize: number;
  gridOpacity: number;
  zoom: number;
  backgroundImage: string | null;
  imageScale: number;
  wallColor: string;
  highlightColor: string;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  rooms,
  furniture,
  selectedRoomId,
  onRoomSelect,
  onRoomMove,
  onRoomResize,
  onRoomScale,
  editorMode,
  gridSize,
  gridOpacity,
  zoom,
  backgroundImage,
  imageScale,
  wallColor,
  highlightColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    onItemScale: onRoomScale,
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
    viewportOffset,
    beginMove,
    beginPan,
    beginResize,
    updateDrag,
    endDrag,
  } = useItemDragResize({
    zoom,
    gridSize,
    selectedItemId: selectedRoomId,
    findItem,
    onItemMove: onRoomMove,
    onItemResize: onRoomResize,
  });

  const handleMouseDown = useCallback(
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
          onRoomSelect(roomId);
          beginScale(e, roomId, item);
        }
        e.stopPropagation();
        return;
      }
      // Only handle room dragging if not panning and not holding space
      if (!isPanning && !e.shiftKey) {
        clearRuler();
        beginMove(e);
        onRoomSelect(roomId);
        e.stopPropagation(); // Prevent event from bubbling up to container
      }
    },
    [
      onRoomSelect,
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
        onRoomSelect(null);
      }
    },
    [onRoomSelect, shouldStartRuler, beginRuler, clearRuler, beginPan],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, roomId: string, wall: ResizeWall) => {
      e.stopPropagation();
      beginResize(e, wall);
      onRoomSelect(roomId);
    },
    [onRoomSelect, beginResize],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
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

  useEffect(() => {
    if (isDragging || isPanning || isRuling || isScaling) {
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
    isRuling,
    isScaling,
    handleMouseMove,
    handleMouseUp,
  ]);

  const modeCursor = MODE_CURSORS[editorMode];
  const sharedItemProps = {
    // Handles would bypass the active tool, so only select mode offers them
    showResizeHandles: editorMode === 'select',
    wallColor,
    highlightColor,
    cursor: modeCursor,
    onMouseDown: handleMouseDown,
    onResizeStart: handleResizeStart,
  };

  return (
    <EditorContainer
      className="LayoutEditor"
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{ cursor: isRuling ? 'crosshair' : modeCursor }}
    >
      <EditorContent
        ref={contentRef}
        zoom={zoom}
        style={{
          transform: `translate(calc(-50% + ${viewportOffset.x}px), calc(-50% + ${viewportOffset.y}px)) scale(${zoom})`,
        }}
      >
        {backgroundImage && (
          <BackgroundImage scale={imageScale} imageUrl={backgroundImage} />
        )}
        <Grid gridSize={gridSize} opacity={gridOpacity} />
        {rooms.map((room) => (
          <LayoutEditorItem
            key={room.id}
            item={room}
            isLivable={room.livability === 'livable'}
            isSelected={selectedRoomId === room.id}
            {...sharedItemProps}
          />
        ))}
        {furniture.map((item) => (
          <LayoutEditorItem
            key={item.id}
            item={item}
            isLivable={false}
            isFurniture
            furnitureColor={item.color}
            isSelected={selectedRoomId === item.id}
            {...sharedItemProps}
          />
        ))}
      </EditorContent>
      <RulerOverlay
        start={rulerStart}
        end={rulerEnd}
        distance={rulerDistance}
        zoom={zoom}
        containerRef={containerRef}
        contentRef={contentRef}
      />
    </EditorContainer>
  );
};
