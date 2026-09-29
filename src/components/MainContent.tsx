import React from 'react';
import Box from '@mui/material/Box';
import { LayoutEditor } from './LayoutEditor';
import { EditorMode, Room, Furniture } from '@/lib/types';
import { ScaledShape } from '@/lib/utils/scaleItem';

interface MainContentProps {
  rooms: Room[];
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomMove: (roomId: string, x: number, y: number) => void;
  onRoomResize: (
    roomId: string,
    width: number,
    height: number,
    isResizing?: boolean,
  ) => void;
  onRoomScale: (
    roomId: string,
    scaled: ScaledShape,
    isScaling?: boolean,
  ) => void;
  editorMode: EditorMode;
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
  onRoomScale,
  editorMode,
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
        onRoomScale={onRoomScale}
        editorMode={editorMode}
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
