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

const RoomElement = styled('div')<{ isLivable: boolean }>(({ isLivable }) => ({
  'position': 'absolute',
  'border': '2px solid #000',
  'backgroundColor': isLivable ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
  'cursor': 'move',
  '&:hover': {
    borderColor: '#666',
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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const snapToGrid = useCallback(
    (value: number) => {
      return Math.round(value / gridSize) * gridSize;
    },
    [gridSize],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, roomId: string) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      onRoomSelect(roomId);
    },
    [onRoomSelect],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart || !selectedRoomId) return;

      const selectedRoom = rooms.find(room => room.id === selectedRoomId);
      if (!selectedRoom) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const newX = selectedRoom.x + dx;
      const newY = selectedRoom.y + dy;

      onRoomMove(selectedRoomId, newX, newY);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, selectedRoomId, onRoomMove, rooms],
  );

  const handleMouseUp = useCallback(() => {
    if (selectedRoomId) {
      const selectedRoom = rooms.find(room => room.id === selectedRoomId);
      if (selectedRoom) {
        const snappedX = snapToGrid(selectedRoom.x);
        const snappedY = snapToGrid(selectedRoom.y);
        onRoomMove(selectedRoomId, snappedX, snappedY);
      }
    }
    setIsDragging(false);
    setDragStart(null);
  }, [selectedRoomId, rooms, snapToGrid, onRoomMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <EditorContainer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}>
      <EditorContent zoom={zoom}>
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
            style={{
              left: `${room.x}em`,
              top: `${room.y}em`,
              width: `${room.width}em`,
              height: `${room.height}em`,
              borderColor: selectedRoomId === room.id ? '#2196f3' : '#000',
            }}
            onMouseDown={e => handleMouseDown(e, room.id)}
          />
        ))}
      </EditorContent>
    </EditorContainer>
  );
};
