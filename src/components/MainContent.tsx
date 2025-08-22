import React from 'react';
import Box from '@mui/material/Box';
import { LayoutEditor } from './LayoutEditor';
import { Room, Furniture } from '@/lib/types';

interface MainContentProps {
  rooms: Room[];
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomMove: (roomId: string, x: number, y: number) => void;
  onRoomResize: (roomId: string, width: number, height: number, isResizing?: boolean) => void;
  gridSize: number;
  zoom: number;
  backgroundImage: string | null;
  imageScale: number;
  gridOpacity: number;
  wallColor: string;
  highlightColor: string;
}

export function MainContent({
  rooms,
  furniture,
  selectedRoomId,
  onRoomSelect,
  onRoomMove,
  onRoomResize,
  gridSize,
  zoom,
  backgroundImage,
  imageScale,
  gridOpacity,
  wallColor,
  highlightColor,
}: MainContentProps) {
  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <LayoutEditor
        rooms={rooms}
        furniture={furniture}
        selectedRoomId={selectedRoomId}
        onRoomSelect={onRoomSelect}
        onRoomMove={onRoomMove}
        onRoomResize={onRoomResize}
        gridSize={gridSize}
        zoom={zoom}
        backgroundImage={backgroundImage}
        imageScale={imageScale}
        gridOpacity={gridOpacity}
        wallColor={wallColor}
        highlightColor={highlightColor}
      />
    </Box>
  );
}
