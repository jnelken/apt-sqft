'use client';

import React, { useRef } from 'react';
import { EditorMode, Room, Furniture } from '@/lib/types';
import {
  ItemMoveHandler,
  ItemResizeHandler,
} from '@/lib/hooks/useItemDragResize';
import { useEditorPointerGestures } from '@/lib/hooks/useEditorPointerGestures';
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
    rulerStart,
    rulerEnd,
    rulerDistance,
    isRuling,
    viewportOffset,
    handleItemMouseDown,
    handleContainerMouseDown,
    handleResizeStart,
    handleContextMenu,
  } = useEditorPointerGestures({
    rooms,
    furniture,
    selectedItemId: selectedRoomId,
    onItemSelect: onRoomSelect,
    onItemMove: onRoomMove,
    onItemResize: onRoomResize,
    onItemScale: onRoomScale,
    editorMode,
    gridSize,
    zoom,
    contentRef,
  });

  const modeCursor = MODE_CURSORS[editorMode];
  const sharedItemProps = {
    // Handles would bypass the active tool, so only select mode offers them
    showResizeHandles: editorMode === 'select',
    wallColor,
    highlightColor,
    cursor: modeCursor,
    onMouseDown: handleItemMouseDown,
    onResizeStart: handleResizeStart,
  };

  return (
    <EditorContainer
      className="LayoutEditor"
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
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
