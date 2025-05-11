import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Point, Room, Wall } from '../types';

const EditorContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  fontSize: '1px',
});

const Grid = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    linear-gradient(to right, ${theme.palette.primary.main}20 1px, transparent 1px),
    linear-gradient(to bottom, ${theme.palette.primary.main}20 1px, transparent 1px)
  `,
  backgroundSize: '1em 1em',
}));

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
  zoom: number;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onRoomMove,
  onRoomResize,
  gridSize,
  zoom,
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

      const newX = snapToGrid(selectedRoom.x + dx);
      const newY = snapToGrid(selectedRoom.y + dy);

      onRoomMove(selectedRoomId, newX, newY);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, selectedRoomId, onRoomMove, snapToGrid, rooms],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

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
      <Grid />
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
    </EditorContainer>
  );
};
