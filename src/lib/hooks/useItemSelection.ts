import { useCallback, useMemo } from 'react';
import { AppState, Room, Furniture, FurnitureInventory, FurnitureInstance } from '@/lib/types';

interface UseItemSelectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setSidebarTab: React.Dispatch<React.SetStateAction<number>>;
  pushToHistory: (newFloorPlan: any) => void;
  handleDeleteRoom: () => void;
  handleDeleteFurniture: () => void;
}

// Helper function to get furniture objects from instances
const getFurnitureFromInstances = (
  instances: FurnitureInstance[],
  inventory: FurnitureInventory,
): Furniture[] => {
  return instances
    .map(instance => {
      const furniture = inventory[instance.furnitureId];
      if (!furniture) return null;
      return {
        ...furniture,
        x: instance.x,
        y: instance.y,
      };
    })
    .filter((furniture): furniture is Furniture => furniture !== null);
};

interface UseItemSelectionReturn {
  selectedRoom: Room | undefined;
  selectedFurniture: Furniture | undefined;
  handleRoomSelect: (roomId: string | null) => void;
  handleRoomMove: (roomId: string, x: number, y: number, isDragging?: boolean) => void;
  handleRoomResize: (roomId: string, width: number, height: number, isResizing?: boolean) => void;
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
  const selectedRoom = useMemo(() => 
    appState.floorPlan.rooms.find(room => room.id === appState.selectedRoomId),
    [appState.floorPlan.rooms, appState.selectedRoomId]
  );

  const selectedFurniture = useMemo(() => {
    if (!appState.selectedRoomId) return undefined;
    const instance = appState.floorPlan.furnitureInstances.find(
      inst => inst.furnitureId === appState.selectedRoomId,
    );
    const furniture = appState.furnitureInventory[appState.selectedRoomId];
    if (!instance || !furniture) return undefined;
    return {
      ...furniture,
      x: instance.x,
      y: instance.y,
    };
  }, [appState.selectedRoomId, appState.floorPlan.furnitureInstances, appState.furnitureInventory]);

  const handleRoomSelect = useCallback((roomId: string | null) => {
    setAppState(prev => ({ ...prev, selectedRoomId: roomId }));
    if (roomId) {
      setSidebarTab(1); // Switch to Room Details tab when a room is selected
    }
  }, [setAppState, setSidebarTab]);

  const handleRoomMove = useCallback((
    roomId: string,
    x: number,
    y: number,
    isDragging: boolean = false,
  ) => {
    // Check if the item is a room or furniture
    const isRoom = appState.floorPlan.rooms.some(room => room.id === roomId);
    const isFurniture = appState.floorPlan.furnitureInstances.some(
      instance => instance.furnitureId === roomId,
    );

    const newFloorPlan = { ...appState.floorPlan };

    if (isRoom) {
      newFloorPlan.rooms = newFloorPlan.rooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              x,
              y,
            }
          : room,
      );
    } else if (isFurniture) {
      newFloorPlan.furnitureInstances = newFloorPlan.furnitureInstances.map(
        instance =>
          instance.furnitureId === roomId
            ? {
                ...instance,
                x,
                y,
              }
            : instance,
      );
    }

    // Only push to history if we're not dragging (i.e., this is the final position)
    if (!isDragging) {
      pushToHistory(newFloorPlan);
    } else {
      // Just update the current state without adding to history
      setAppState(prev => ({
        ...prev,
        floorPlan: newFloorPlan,
      }));
    }
  }, [appState.floorPlan, pushToHistory, setAppState]);

  const handleRoomResize = useCallback((
    roomId: string,
    width: number,
    height: number,
    isResizing: boolean = false,
  ) => {
    const newFloorPlan = { ...appState.floorPlan };
    const isRoom = newFloorPlan.rooms.some(room => room.id === roomId);
    const isFurniture = newFloorPlan.furnitureInstances.some(
      instance => instance.furnitureId === roomId,
    );

    if (isRoom) {
      newFloorPlan.rooms = newFloorPlan.rooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              width,
              height,
            }
          : room,
      );
    } else if (isFurniture) {
      // Update furniture in inventory
      const updatedInventory = {
        ...appState.furnitureInventory,
        [roomId]: {
          ...appState.furnitureInventory[roomId],
          width,
          height,
        },
      };

      setAppState(prev => ({
        ...prev,
        furnitureInventory: updatedInventory,
      }));
    }

    // Only push to history if we're not resizing (i.e., this is the final size)
    if (!isResizing) {
      pushToHistory(newFloorPlan);
    } else {
      // Just update the current state without adding to history
      setAppState(prev => ({
        ...prev,
        floorPlan: newFloorPlan,
      }));
    }
  }, [appState.floorPlan, appState.furnitureInventory, setAppState, pushToHistory]);

  const handleSwapDimensions = useCallback(() => {
    if (appState.selectedRoomId) {
      const selectedRoom = appState.floorPlan.rooms.find(
        room => room.id === appState.selectedRoomId,
      );
      const selectedFurniture = (() => {
        if (!appState.selectedRoomId) return undefined;
        const instance = appState.floorPlan.furnitureInstances.find(
          inst => inst.furnitureId === appState.selectedRoomId,
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
          rooms: appState.floorPlan.rooms.map(room =>
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

        setAppState(prev => ({
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

    // Check if the selected item is a room
    const isRoom = appState.floorPlan.rooms.some(
      room => room.id === appState.selectedRoomId,
    );

    if (isRoom) {
      handleDeleteRoom();
    } else {
      // It must be furniture
      handleDeleteFurniture();
    }
  }, [appState.selectedRoomId, appState.floorPlan.rooms, handleDeleteRoom, handleDeleteFurniture]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSidebarTab(newValue);
    // Clear room selection when switching to Add Room tab
    if (newValue === 0) {
      setAppState(prev => ({ ...prev, selectedRoomId: null }));
    }
  }, [setSidebarTab, setAppState]);

  return {
    selectedRoom,
    selectedFurniture,
    handleRoomSelect,
    handleRoomMove,
    handleRoomResize,
    handleSwapDimensions,
    handleDeleteSelected,
    handleTabChange,
  };
};