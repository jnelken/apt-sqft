import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Point, Room, Wall } from '../types';

const EditorContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  fontSize: '1px',
}));

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

const BackgroundImage = styled('div')<{ scale: number }>(
  ({ theme, scale }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) scale(${scale})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
    minWidth: '100%',
    minHeight: '100%',
    filter:
      theme.palette.mode === 'dark' ? 'invert(1) brightness(0.6)' : 'none',
  }),
);

const RoomElement = styled('div')<{
  isLivable: boolean;
  wallColor: string;
  isSelected: boolean;
  highlightColor: string;
}>(({ isLivable, wallColor, isSelected, highlightColor }) => ({
  'position': 'absolute',
  'border': `2px solid ${wallColor}`,
  'backgroundColor': isSelected
    ? highlightColor
    : isLivable
    ? 'transparent'
    : 'rgba(0, 0, 0, 0.5)',
  'backgroundImage':
    !isLivable && !isSelected
      ? `repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.5),
        rgba(0, 0, 0, 0.5) 10px,
        rgba(0, 0, 0, 0.3) 10px,
        rgba(0, 0, 0, 0.3) 20px
      )`
      : 'none',
  'cursor': 'move',
  'opacity': 1,

  '&:hover': {
    borderColor: wallColor,
    opacity: 0.8,
  },
}));

interface LayoutEditorProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomMove: (roomId: string, x: number, y: number) => void;
  onRoomResize: (roomId: string, width: number, height: number) => void;
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
  selectedRoomId,
  onRoomSelect,
  onRoomMove,
  onRoomResize,
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
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [viewportOffset, setViewportOffset] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const snapToGrid = useCallback(
    (value: number) => {
      return Math.round(value / gridSize) * gridSize;
    },
    [gridSize],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, roomId: string) => {
      // Only handle room dragging if not panning and not holding space
      if (!isPanning && !e.shiftKey) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        onRoomSelect(roomId);
      }
    },
    [onRoomSelect, isPanning],
  );

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    // Start panning if holding shift or right mouse button
    if (e.shiftKey || e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart) return;

      if (isPanning) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setViewportOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isDragging && selectedRoomId) {
        const selectedRoom = rooms.find(room => room.id === selectedRoomId);
        if (!selectedRoom) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const newX = selectedRoom.x + dx;
        const newY = selectedRoom.y + dy;

        onRoomMove(selectedRoomId, newX, newY);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isPanning, isDragging, dragStart, selectedRoomId, onRoomMove, rooms],
  );

  const handleMouseUp = useCallback(() => {
    if (selectedRoomId && isDragging) {
      const selectedRoom = rooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        const snappedX = snapToGrid(selectedRoom.x);
        const snappedY = snapToGrid(selectedRoom.y);
        onRoomMove(selectedRoomId, snappedX, snappedY);
      }
    }
    setIsDragging(false);
    setIsPanning(false);
    setDragStart(null);
  }, [selectedRoomId, rooms, snapToGrid, onRoomMove, isDragging]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (isDragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isPanning, handleMouseMove, handleMouseUp]);

  return (
    <EditorContainer
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}>
      <EditorContent
        zoom={zoom}
        style={{
          transform: `translate(calc(-50% + ${viewportOffset.x}px), calc(-50% + ${viewportOffset.y}px)) scale(${zoom})`,
        }}>
        {backgroundImage && (
          <BackgroundImage
            scale={imageScale}
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <Grid gridSize={gridSize} opacity={gridOpacity} />
        {rooms.map(room => (
          <RoomElement
            key={room.id}
            isLivable={room.isLivable}
            wallColor={wallColor}
            isSelected={selectedRoomId === room.id}
            highlightColor={highlightColor}
            style={{
              left: `${room.x}em`,
              top: `${room.y}em`,
              width: `${room.width}em`,
              height: `${room.height}em`,
              borderColor: selectedRoomId === room.id ? '#2196f3' : wallColor,
            }}
            onMouseDown={e => handleMouseDown(e, room.id)}
          />
        ))}
      </EditorContent>
    </EditorContainer>
  );
};
