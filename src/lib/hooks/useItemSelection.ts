import { useCallback, useMemo } from 'react';
import { AppState, Room, Furniture, FloorPlan } from '@/lib/types';
import { ScaledShape } from '@/lib/utils/scaleItem';

interface UseItemSelectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setSidebarTab: React.Dispatch<React.SetStateAction<number>>;
  pushToHistory: (newFloorPlan: FloorPlan) => void;
  handleDeleteRoom: () => void;
  handleDeleteFurniture: () => void;
}

/**
 * A plain rectangle's area is its bounding box. A room with custom points isn't
 * a rectangle, so its existing area scales by the same ratio as the box.
 */
export const scaledSqFootage = (
  room: Room,
  width: number,
  height: number,
): number => {
  const boxArea = room.width * room.height;
  if (room.points.length < 3 || boxArea <= 0) return (width * height) / 144;
  return room.sqFootage * ((width * height) / boxArea);
};

const hasRoom = (floorPlan: FloorPlan, id: string): boolean =>
  floorPlan.rooms.some((room) => room.id === id);

const hasFurniture = (floorPlan: FloorPlan, id: string): boolean =>
  floorPlan.furnitureInstances.some((instance) => instance.furnitureId === id);

interface UseItemSelectionReturn {
  selectedRoom: Room | undefined;
  selectedFurniture: Furniture | undefined;
  handleRoomSelect: (roomId: string | null) => void;
  handleRoomMove: (
    roomId: string,
    x: number,
    y: number,
    isDragging?: boolean,
  ) => void;
  handleRoomResize: (
    roomId: string,
    width: number,
    height: number,
    isResizing?: boolean,
  ) => void;
  handleRoomScale: (
    roomId: string,
    scaled: ScaledShape,
    isScaling?: boolean,
  ) => void;
  handleSwapDimensions: () => void;
  handleDeleteSelected: () => void;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const useItemSelection = ({
  appState,
  setAppState,
  setSidebarTab,
  pushToHistory,
  handleDeleteRoom,
  handleDeleteFurniture,
}: UseItemSelectionProps): UseItemSelectionReturn => {
  // Computed values for selected items
  const selectedRoom = useMemo(
    () =>
      appState.floorPlan.rooms.find(
        (room) => room.id === appState.selectedRoomId,
      ),
    [appState.floorPlan.rooms, appState.selectedRoomId],
  );

  const selectedFurniture = useMemo(() => {
    if (!appState.selectedRoomId) return undefined;
    const instance = appState.floorPlan.furnitureInstances.find(
      (inst) => inst.furnitureId === appState.selectedRoomId,
    );
    const furniture = appState.furnitureInventory[appState.selectedRoomId];
    if (!instance || !furniture) return undefined;
    return {
      ...furniture,
      x: instance.x,
      y: instance.y,
    };
  }, [
    appState.selectedRoomId,
    appState.floorPlan.furnitureInstances,
    appState.furnitureInventory,
  ]);

  const handleRoomSelect = useCallback(
    (roomId: string | null) => {
      setAppState((prev) => ({ ...prev, selectedRoomId: roomId }));
      if (roomId) {
        setSidebarTab(1); // Switch to Room Details tab when a room is selected
      }
    },
    [setAppState, setSidebarTab],
  );

  // A drag previews every frame without history; only its release is undoable.
  const commitFloorPlan = useCallback(
    (newFloorPlan: FloorPlan, isPreview: boolean) => {
      if (isPreview) {
        setAppState((prev) => ({ ...prev, floorPlan: newFloorPlan }));
      } else {
        pushToHistory(newFloorPlan);
      }
    },
    [pushToHistory, setAppState],
  );

  const handleRoomMove = useCallback(
    (roomId: string, x: number, y: number, isDragging: boolean = false) => {
      const newFloorPlan = { ...appState.floorPlan };

      if (hasRoom(newFloorPlan, roomId)) {
        newFloorPlan.rooms = newFloorPlan.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                x,
                y,
              }
            : room,
        );
      } else if (hasFurniture(newFloorPlan, roomId)) {
        newFloorPlan.furnitureInstances = newFloorPlan.furnitureInstances.map(
          (instance) =>
            instance.furnitureId === roomId
              ? {
                  ...instance,
                  x,
                  y,
                }
              : instance,
        );
      }

      commitFloorPlan(newFloorPlan, isDragging);
    },
    [appState.floorPlan, commitFloorPlan],
  );

  const handleRoomResize = useCallback(
    (
      roomId: string,
      width: number,
      height: number,
      isResizing: boolean = false,
    ) => {
      const newFloorPlan = { ...appState.floorPlan };

      if (hasRoom(newFloorPlan, roomId)) {
        newFloorPlan.rooms = newFloorPlan.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                width,
                height,
              }
            : room,
        );
      } else if (hasFurniture(newFloorPlan, roomId)) {
        // Update furniture in inventory
        const updatedInventory = {
          ...appState.furnitureInventory,
          [roomId]: {
            ...appState.furnitureInventory[roomId],
            width,
            height,
          },
        };

        setAppState((prev) => ({
          ...prev,
          furnitureInventory: updatedInventory,
        }));
      }

      commitFloorPlan(newFloorPlan, isResizing);
    },
    [
      appState.floorPlan,
      appState.furnitureInventory,
      setAppState,
      commitFloorPlan,
    ],
  );

  const handleRoomScale = useCallback(
    (
      roomId: string,
      { width, height, points }: ScaledShape,
      isScaling: boolean = false,
    ) => {
      if (!hasRoom(appState.floorPlan, roomId)) {
        // FIXME(advance-roadmap review): furniture dimensions live in furnitureInventory, which undo/redo history doesn't snapshot, so a furniture scale (like a furniture resize) can't be undone — codex, 2026-09-29
        handleRoomResize(roomId, width, height, isScaling);
        return;
      }

      const newFloorPlan = {
        ...appState.floorPlan,
        rooms: appState.floorPlan.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                width,
                height,
                points,
                sqFootage: scaledSqFootage(room, width, height),
              }
            : room,
        ),
      };

      commitFloorPlan(newFloorPlan, isScaling);
    },
    [appState.floorPlan, handleRoomResize, commitFloorPlan],
  );

  const handleSwapDimensions = useCallback(() => {
    if (appState.selectedRoomId) {
      const selectedRoom = appState.floorPlan.rooms.find(
        (room) => room.id === appState.selectedRoomId,
      );
      const selectedFurniture = (() => {
        if (!appState.selectedRoomId) return undefined;
        const instance = appState.floorPlan.furnitureInstances.find(
          (inst) => inst.furnitureId === appState.selectedRoomId,
        );
        const furniture = appState.furnitureInventory[appState.selectedRoomId];
        if (!instance || !furniture) return undefined;
        return {
          ...furniture,
          x: instance.x,
          y: instance.y,
        };
      })();

      if (selectedRoom) {
        const newRoom = {
          ...selectedRoom,
          height: selectedRoom.width,
          width: selectedRoom.height,
          sqFootage: (selectedRoom.width * selectedRoom.height) / 144,
        };
        const newFloorPlan = {
          ...appState.floorPlan,
          rooms: appState.floorPlan.rooms.map((room) =>
            room.id === appState.selectedRoomId ? newRoom : room,
          ),
        };
        pushToHistory(newFloorPlan);
      } else if (selectedFurniture) {
        // Update furniture in inventory
        const updatedInventory = {
          ...appState.furnitureInventory,
          [appState.selectedRoomId]: {
            ...appState.furnitureInventory[appState.selectedRoomId],
            height: selectedFurniture.width,
            width: selectedFurniture.height,
          },
        };

        setAppState((prev) => ({
          ...prev,
          furnitureInventory: updatedInventory,
        }));

        const newFloorPlan = appState.floorPlan; // No change to floor plan needed
        pushToHistory(newFloorPlan);
      }
    }
  }, [appState, setAppState, pushToHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (!appState.selectedRoomId) return;

    if (hasRoom(appState.floorPlan, appState.selectedRoomId)) {
      handleDeleteRoom();
    } else {
      // It must be furniture
      handleDeleteFurniture();
    }
  }, [
    appState.selectedRoomId,
    appState.floorPlan,
    handleDeleteRoom,
    handleDeleteFurniture,
  ]);

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setSidebarTab(newValue);
      // Clear room selection when switching to Add Room tab
      if (newValue === 0) {
        setAppState((prev) => ({ ...prev, selectedRoomId: null }));
      }
    },
    [setSidebarTab, setAppState],
  );

  return {
    selectedRoom,
    selectedFurniture,
    handleRoomSelect,
    handleRoomMove,
    handleRoomResize,
    handleRoomScale,
    handleSwapDimensions,
    handleDeleteSelected,
    handleTabChange,
  };
};
