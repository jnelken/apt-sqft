import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Point, Room, Wall, Furniture } from '../types';

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
    'position': 'absolute',
    'border': `2px solid ${wallColor}`,
    'backgroundColor': isSelected
      ? highlightColor
      : isFurniture
      ? furnitureColor || '#FFA500'
      : isLivable
      ? 'transparent'
      : 'rgba(0, 0, 0, 0.5)',
    'backgroundImage':
      !isLivable && !isSelected && !isFurniture
        ? `repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.5),
        rgba(0, 0, 0, 0.5) 10px,
        rgba(0, 0, 0, 0.3) 10px,
        rgba(0, 0, 0, 0.3) 20px
      )`
        : 'none',
    'cursor': 'move',
    'opacity': isFurniture ? 1 : 0.5,

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
  const [resizeWall, setResizeWall] = useState<string | null>(null);
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
        e.stopPropagation(); // Prevent event from bubbling up to container
      }
    },
    [onRoomSelect, isPanning],
  );

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Start panning if holding shift or right mouse button
      if (e.shiftKey || e.button === 2) {
        e.preventDefault();
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        // Clear selection when clicking empty space
        onRoomSelect(null);
      }
    },
    [onRoomSelect],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, roomId: string, wall: string) => {
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
      if (!dragStart) return;

      if (isPanning) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        setViewportOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isDragging && selectedRoomId) {
        // Find the selected item in either rooms or furniture
        const selectedRoom = rooms.find(room => room.id === selectedRoomId);
        const selectedFurniture = furniture.find(
          item => item.id === selectedRoomId,
        );
        const selectedItem = selectedRoom || selectedFurniture;

        if (!selectedItem) return;

        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;

        // Calculate new absolute position
        const newX = selectedItem.x + dx;
        const newY = selectedItem.y + dy;

        onRoomMove(selectedRoomId, newX, newY, true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && selectedRoomId && resizeWall) {
        // Find the selected item in either rooms or furniture
        const selectedRoom = rooms.find(room => room.id === selectedRoomId);
        const selectedFurniture = furniture.find(
          item => item.id === selectedRoomId,
        );
        const selectedItem = selectedRoom || selectedFurniture;

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
      isPanning,
      isDragging,
      isResizing,
      dragStart,
      selectedRoomId,
      resizeWall,
      onRoomMove,
      onRoomResize,
      rooms,
      furniture,
      gridSize,
      zoom,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (selectedRoomId) {
      if (isDragging) {
        // Find the selected item in either rooms or furniture
        const selectedRoom = rooms.find(room => room.id === selectedRoomId);
        const selectedFurniture = furniture.find(
          item => item.id === selectedRoomId,
        );
        const selectedItem = selectedRoom || selectedFurniture;

        if (selectedItem) {
          const snappedX = snapToGrid(selectedItem.x);
          const snappedY = snapToGrid(selectedItem.y);
          onRoomMove(selectedRoomId, snappedX, snappedY, false);
        }
      } else if (isResizing) {
        // Find the selected item in either rooms or furniture
        const selectedRoom = rooms.find(room => room.id === selectedRoomId);
        const selectedFurniture = furniture.find(
          item => item.id === selectedRoomId,
        );
        const selectedItem = selectedRoom || selectedFurniture;

        if (selectedItem) {
          // Snap dimensions to grid
          const snappedWidth = snapToGrid(selectedItem.width);
          const snappedHeight = snapToGrid(selectedItem.height);
          let snappedX = selectedItem.x;
          let snappedY = selectedItem.y;

          // Adjust position for west and north walls after snapping
          if (resizeWall === 'w') {
            const widthDiff = snappedWidth - selectedItem.width;
            snappedX = selectedItem.x + widthDiff;
          }
          if (resizeWall === 'n') {
            const heightDiff = snappedHeight - selectedItem.height;
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
    selectedRoomId,
    rooms,
    furniture,
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
      className="LayoutEditor"
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
          <BackgroundImage scale={imageScale} imageUrl={backgroundImage} />
        )}
        <Grid gridSize={gridSize} opacity={gridOpacity} />
        {rooms.map(room => (
          <RoomElement
            key={room.id}
            isLivable={room.livability === 'livable'}
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
            onMouseDown={e => handleMouseDown(e, room.id)}>
            {selectedRoomId === room.id && (
              <>
                <ResizeHandle
                  position="e"
                  onMouseDown={e => handleResizeStart(e, room.id, 'e')}
                />
                <ResizeHandle
                  position="w"
                  onMouseDown={e => handleResizeStart(e, room.id, 'w')}
                />
                <ResizeHandle
                  position="n"
                  onMouseDown={e => handleResizeStart(e, room.id, 'n')}
                />
                <ResizeHandle
                  position="s"
                  onMouseDown={e => handleResizeStart(e, room.id, 's')}
                />
              </>
            )}
          </RoomElement>
        ))}
        {furniture.map(item => (
          <RoomElement
            key={item.id}
            isLivable={false}
            wallColor={wallColor}
            isSelected={selectedRoomId === item.id}
            highlightColor={highlightColor}
            isFurniture={true}
            furnitureColor={item.color}
            style={{
              left: `${item.x}em`,
              top: `${item.y}em`,
              width: `${item.width}em`,
              height: `${item.height}em`,
              borderColor: selectedRoomId === item.id ? '#2196f3' : wallColor,
            }}
            onMouseDown={e => handleMouseDown(e, item.id)}>
            {selectedRoomId === item.id && (
              <>
                <ResizeHandle
                  position="e"
                  onMouseDown={e => handleResizeStart(e, item.id, 'e')}
                />
                <ResizeHandle
                  position="w"
                  onMouseDown={e => handleResizeStart(e, item.id, 'w')}
                />
                <ResizeHandle
                  position="n"
                  onMouseDown={e => handleResizeStart(e, item.id, 'n')}
                />
                <ResizeHandle
                  position="s"
                  onMouseDown={e => handleResizeStart(e, item.id, 's')}
                />
              </>
            )}
          </RoomElement>
        ))}
      </EditorContent>
    </EditorContainer>
  );
};
