'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Room } from '@/lib/types';

export type ResizeWall = 'e' | 'w' | 'n' | 's';

const RESIZE_WALLS: ResizeWall[] = ['e', 'w', 'n', 's'];

const SELECTED_BORDER_COLOR = '#2196f3';

const RoomElement = styled('div')<{
  isLivable: boolean;
  wallColor: string;
  isSelected: boolean;
  highlightColor: string;
  isFurniture?: boolean;
  furnitureColor?: string;
}>(
  ({
    isLivable,
    wallColor,
    isSelected,
    highlightColor,
    isFurniture,
    furnitureColor,
  }) => ({
    position: 'absolute',
    border: `2px solid ${wallColor}`,
    backgroundColor: isSelected
      ? highlightColor
      : isFurniture
        ? furnitureColor || '#FFA500'
        : isLivable
          ? 'transparent'
          : 'rgba(0, 0, 0, 0.5)',
    backgroundImage:
      !isLivable && !isSelected && !isFurniture
        ? `repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.5),
        rgba(0, 0, 0, 0.5) 10px,
        rgba(0, 0, 0, 0.3) 10px,
        rgba(0, 0, 0, 0.3) 20px
      )`
        : 'none',
    cursor: 'move',
    opacity: isFurniture ? 1 : 0.5,

    '&:hover': {
      borderColor: wallColor,
      opacity: isFurniture ? 1 : 0.6,
    },
  }),
);

const ResizeHandle = styled('div')<{ position: string }>(({ position }) => ({
  position: 'absolute',
  width: '10px',
  height: '10px',
  backgroundColor: '#2196f3',
  borderRadius: '50%',
  cursor: position.includes('e') ? 'ew-resize' : 'ns-resize',
  ...(position === 'e' && {
    right: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
  }),
  ...(position === 'w' && {
    left: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
  }),
  ...(position === 'n' && {
    top: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
  }),
  ...(position === 's' && {
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
  }),
}));

interface LayoutEditorItemProps {
  item: Pick<Room, 'id' | 'x' | 'y' | 'width' | 'height'>;
  isLivable: boolean;
  isFurniture?: boolean;
  furnitureColor?: string;
  isSelected: boolean;
  showResizeHandles: boolean;
  wallColor: string;
  highlightColor: string;
  cursor: string | undefined;
  onMouseDown: (e: React.MouseEvent, itemId: string) => void;
  onResizeStart: (
    e: React.MouseEvent,
    itemId: string,
    wall: ResizeWall,
  ) => void;
}

/** A room or furniture rectangle on the canvas, sized in em (1em ≈ 1 inch). */
export const LayoutEditorItem: React.FC<LayoutEditorItemProps> = ({
  item,
  isLivable,
  isFurniture,
  furnitureColor,
  isSelected,
  showResizeHandles,
  wallColor,
  highlightColor,
  cursor,
  onMouseDown,
  onResizeStart,
}) => (
  <RoomElement
    isLivable={isLivable}
    wallColor={wallColor}
    isSelected={isSelected}
    highlightColor={highlightColor}
    isFurniture={isFurniture}
    furnitureColor={furnitureColor}
    style={{
      left: `${item.x}em`,
      top: `${item.y}em`,
      width: `${item.width}em`,
      height: `${item.height}em`,
      borderColor: isSelected ? SELECTED_BORDER_COLOR : wallColor,
      cursor,
    }}
    onMouseDown={(e) => onMouseDown(e, item.id)}
  >
    {showResizeHandles &&
      isSelected &&
      RESIZE_WALLS.map((wall) => (
        <ResizeHandle
          key={wall}
          position={wall}
          onMouseDown={(e) => onResizeStart(e, item.id, wall)}
        />
      ))}
  </RoomElement>
);
