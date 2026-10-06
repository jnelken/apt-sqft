'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { EditorMode, Point, Room, Furniture } from '@/lib/types';
import { useRuler } from '@/lib/hooks/useRuler';
import { useScaleDrag } from '@/lib/hooks/useScaleDrag';
import { ScaledShape } from '@/lib/utils/scaleItem';
import { RulerOverlay } from './ui/RulerOverlay';
import { LayoutEditorItem, ResizeWall } from './LayoutEditorItem';

/** position relative container */
const EditorContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  fontSize: '1px',
}));

/** Centered zoom container */
const EditorContent = styled('div')<{ zoom: number }>(({ zoom }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%) scale(${zoom})`,
  transformOrigin: 'center center',
  width: '100%',
  height: '100%',
}));

const Grid = styled('div')<{ gridSize: number; opacity: number }>(
  ({ theme, gridSize, opacity }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
    linear-gradient(to right, ${theme.palette.primary.main}${Math.round(
      opacity * 255,
    )
      .toString(16)
      .padStart(2, '0')} 1px, transparent 1px),
    linear-gradient(to bottom, ${theme.palette.primary.main}${Math.round(
      opacity * 255,
    )
      .toString(16)
      .padStart(2, '0')} 1px, transparent 1px)
      `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  }),
);

const BackgroundImage = styled('div')<{ scale: number; imageUrl: string }>(
  ({ theme, scale, imageUrl }) => ({
    opacity: 0.5,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    pointerEvents: 'none',
    filter:
      theme.palette.mode === 'dark' ? 'invert(1) brightness(0.6)' : 'none',
  }),
);

const MODE_CURSORS: Record<EditorMode, string | undefined> = {
  select: undefined,
  scale: 'ns-resize',
  ruler: 'crosshair',
};

interface LayoutEditorProps {
  rooms: Room[];
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomMove: (
    roomId: string,
    x: number,
    y: number,
    isDragging: boolean,
  ) => void;
  onRoomResize: (
    roomId: string,
    width: number,
    height: number,
    isResizing: boolean,
  ) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeWall, setResizeWall] = useState<ResizeWall | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [viewportOffset, setViewportOffset] = useState<Point>({ x: 0, y: 0 });
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

  const snapToGrid = useCallback(
    (value: number) => {
      return Math.round(value / gridSize) * gridSize;
    },
    [gridSize],
  );

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
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
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
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        // Clear selection and any measurement when clicking empty space
        clearRuler();
        onRoomSelect(null);
      }
    },
    [onRoomSelect, shouldStartRuler, beginRuler, clearRuler],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, roomId: string, wall: ResizeWall) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeWall(wall);
      setDragStart({ x: e.clientX, y: e.clientY });
      onRoomSelect(roomId);
    },
    [onRoomSelect],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isRuling) {
        updateRuler(e);
        return;
      }
      if (isScaling) {
        updateScale(e);
        return;
      }

      if (!dragStart) return;

      if (isPanning) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        setViewportOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isDragging && selectedRoomId) {
        const selectedItem = findItem(selectedRoomId);

        if (!selectedItem) return;

        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;

        // Calculate new absolute position
        const newX = selectedItem.x + dx;
        const newY = selectedItem.y + dy;

        onRoomMove(selectedRoomId, newX, newY, true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && selectedRoomId && resizeWall) {
        const selectedItem = findItem(selectedRoomId);

        if (!selectedItem) return;

        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;

        let newWidth = selectedItem.width;
        let newHeight = selectedItem.height;
        let newX = selectedItem.x;
        let newY = selectedItem.y;

        switch (resizeWall) {
          case 'e':
            newWidth = Math.max(gridSize, selectedItem.width + dx);
            break;
          case 'w':
            newWidth = Math.max(gridSize, selectedItem.width - dx);
            newX = selectedItem.x + dx;
            break;
          case 's':
            newHeight = Math.max(gridSize, selectedItem.height + dy);
            break;
          case 'n':
            newHeight = Math.max(gridSize, selectedItem.height - dy);
            newY = selectedItem.y + dy;
            break;
        }

        // Update item dimensions immediately
        onRoomResize(selectedRoomId, newWidth, newHeight, true);
        if (newX !== selectedItem.x || newY !== selectedItem.y) {
          onRoomMove(selectedRoomId, newX, newY, true);
        }
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [
      isRuling,
      updateRuler,
      isScaling,
      updateScale,
      isPanning,
      isDragging,
      isResizing,
      dragStart,
      selectedRoomId,
      resizeWall,
      onRoomMove,
      onRoomResize,
      findItem,
      gridSize,
      zoom,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (isRuling) {
      // Keep the measurement on screen until the next interaction
      endRuler();
    }
    if (isScaling) {
      endScale();
    }
    if (selectedRoomId) {
      if (isDragging) {
        const selectedItem = findItem(selectedRoomId);

        if (selectedItem) {
          const snappedX = snapToGrid(selectedItem.x);
          const snappedY = snapToGrid(selectedItem.y);
          onRoomMove(selectedRoomId, snappedX, snappedY, false);
        }
      } else if (isResizing) {
        const selectedItem = findItem(selectedRoomId);

        if (selectedItem) {
          // Snap dimensions to grid
          const snappedWidth = snapToGrid(selectedItem.width);
          const snappedHeight = snapToGrid(selectedItem.height);
          let snappedX = selectedItem.x;
          let snappedY = selectedItem.y;

          // Adjust position for west and north walls after snapping
          if (resizeWall === 'w') {
            // When width decreases after snapping, x should move right (dx positive); when it increases, x moves left (dx negative)
            const widthDiff = selectedItem.width - snappedWidth;
            snappedX = selectedItem.x + widthDiff;
          }
          if (resizeWall === 'n') {
            // When height decreases after snapping, y should move down (dy positive); when it increases, y moves up (dy negative)
            const heightDiff = selectedItem.height - snappedHeight;
            snappedY = selectedItem.y + heightDiff;
          }

          // Update final dimensions and position
          onRoomResize(selectedRoomId, snappedWidth, snappedHeight, false);
          if (snappedX !== selectedItem.x || snappedY !== selectedItem.y) {
            onRoomMove(selectedRoomId, snappedX, snappedY, false);
          }
        }
      }
    }
    setIsDragging(false);
    setIsPanning(false);
    setIsResizing(false);
    setResizeWall(null);
    setDragStart(null);
  }, [
    isRuling,
    endRuler,
    isScaling,
    endScale,
    selectedRoomId,
    findItem,
    snapToGrid,
    onRoomMove,
    onRoomResize,
    isDragging,
    isResizing,
    resizeWall,
  ]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Bridge native events to React handler without using `any`
  const handleWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      // Minimal shim object for the fields we read in handleMouseMove
      const synthetic = {
        clientX: e.clientX,
        clientY: e.clientY,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        // No-op to satisfy potential event usage
        stopPropagation: () => {},
        preventDefault: () => {},
      } as unknown as React.MouseEvent;
      handleMouseMove(synthetic);
    },
    [handleMouseMove],
  );

  useEffect(() => {
    if (isDragging || isPanning || isRuling || isScaling) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isPanning,
    isRuling,
    isScaling,
    handleWindowMouseMove,
    handleMouseUp,
  ]);

  const modeCursor = MODE_CURSORS[editorMode];
  // Handles would bypass the active tool, so only select mode offers them
  const showResizeHandles = editorMode === 'select';

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
            showResizeHandles={showResizeHandles}
            wallColor={wallColor}
            highlightColor={highlightColor}
            cursor={modeCursor}
            onMouseDown={handleMouseDown}
            onResizeStart={handleResizeStart}
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
            showResizeHandles={showResizeHandles}
            wallColor={wallColor}
            highlightColor={highlightColor}
            cursor={modeCursor}
            onMouseDown={handleMouseDown}
            onResizeStart={handleResizeStart}
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
