import { useCallback, useState } from 'react';
import { Furniture, Point, ResizeWall, Room } from '@/lib/types';

type Item = Room | Furniture;

interface ItemBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClientPosition {
  clientX: number;
  clientY: number;
}

export type ItemMoveHandler = (
  itemId: string,
  x: number,
  y: number,
  isDragging: boolean,
) => void;

export type ItemResizeHandler = (
  itemId: string,
  width: number,
  height: number,
  isResizing: boolean,
) => void;

interface UseItemDragResizeParams {
  zoom: number;
  gridSize: number;
  selectedItemId: string | null;
  findItem: (itemId: string) => Item | undefined;
  onItemMove: ItemMoveHandler;
  onItemResize: ItemResizeHandler;
}

const snap = (value: number, gridSize: number) =>
  Math.round(value / gridSize) * gridSize;

/** Drags one wall by a data-inch delta; west and north walls also move the origin. */
function resizeFromWall(
  item: ItemBox,
  wall: ResizeWall,
  dx: number,
  dy: number,
  gridSize: number,
): ItemBox {
  const next = { ...item };
  switch (wall) {
    case 'e':
      next.width = Math.max(gridSize, item.width + dx);
      break;
    case 'w':
      next.width = Math.max(gridSize, item.width - dx);
      next.x = item.x + dx;
      break;
    case 's':
      next.height = Math.max(gridSize, item.height + dy);
      break;
    case 'n':
      next.height = Math.max(gridSize, item.height - dy);
      next.y = item.y + dy;
      break;
  }
  return next;
}

/** Snaps the size to the grid, keeping the opposite wall fixed for west and north. */
function snapResize(
  item: ItemBox,
  wall: ResizeWall | null,
  gridSize: number,
): ItemBox {
  const width = snap(item.width, gridSize);
  const height = snap(item.height, gridSize);
  return {
    width,
    height,
    x: wall === 'w' ? item.x + (item.width - width) : item.x,
    y: wall === 'n' ? item.y + (item.height - height) : item.y,
  };
}

/**
 * Owns the select-mode pointer gestures: moving an item, resizing it from a
 * wall, and panning the viewport. Moves preview without history and release
 * snaps the item to the grid as the committing change.
 */
export function useItemDragResize({
  zoom,
  gridSize,
  selectedItemId,
  findItem,
  onItemMove,
  onItemResize,
}: UseItemDragResizeParams) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeWall, setResizeWall] = useState<ResizeWall | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [viewportOffset, setViewportOffset] = useState<Point>({ x: 0, y: 0 });

  const beginMove = useCallback((e: ClientPosition) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const beginPan = useCallback((e: ClientPosition) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const beginResize = useCallback((e: ClientPosition, wall: ResizeWall) => {
    setIsResizing(true);
    setResizeWall(wall);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const updateDrag = useCallback(
    (e: ClientPosition) => {
      if (!dragStart) return;

      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      if (isPanning) {
        setViewportOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (isDragging && selectedItemId) {
        const item = findItem(selectedItemId);
        if (!item) return;
        onItemMove(selectedItemId, item.x + dx, item.y + dy, true);
      } else if (isResizing && selectedItemId && resizeWall) {
        const item = findItem(selectedItemId);
        if (!item) return;
        const next = resizeFromWall(item, resizeWall, dx, dy, gridSize);
        onItemResize(selectedItemId, next.width, next.height, true);
        if (next.x !== item.x || next.y !== item.y) {
          onItemMove(selectedItemId, next.x, next.y, true);
        }
      } else {
        return;
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [
      dragStart,
      zoom,
      isPanning,
      isDragging,
      isResizing,
      selectedItemId,
      resizeWall,
      findItem,
      onItemMove,
      onItemResize,
      gridSize,
    ],
  );

  const endDrag = useCallback(() => {
    if (selectedItemId) {
      const item = findItem(selectedItemId);
      if (isDragging) {
        if (item) {
          onItemMove(
            selectedItemId,
            snap(item.x, gridSize),
            snap(item.y, gridSize),
            false,
          );
        }
      } else if (isResizing && item) {
        const snapped = snapResize(item, resizeWall, gridSize);
        onItemResize(selectedItemId, snapped.width, snapped.height, false);
        if (snapped.x !== item.x || snapped.y !== item.y) {
          onItemMove(selectedItemId, snapped.x, snapped.y, false);
        }
      }
    }
    setIsDragging(false);
    setIsPanning(false);
    setIsResizing(false);
    setResizeWall(null);
    setDragStart(null);
  }, [
    selectedItemId,
    findItem,
    isDragging,
    isResizing,
    resizeWall,
    gridSize,
    onItemMove,
    onItemResize,
  ]);

  return {
    isDragging,
    isPanning,
    isResizing,
    viewportOffset,
    beginMove,
    beginPan,
    beginResize,
    updateDrag,
    endDrag,
  };
}
