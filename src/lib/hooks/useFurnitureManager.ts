import { useCallback } from 'react';
import { Furniture, FurnitureInstance, AppState } from '@/lib/types';

interface UseFurnitureManagerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  pushToHistory: (newFloorPlan: any) => void;
  setSidebarTab: React.Dispatch<React.SetStateAction<number>>;
}

interface UseFurnitureManagerReturn {
  handleAddFurniture: (furnitureData: Omit<Furniture, 'id' | 'points'>) => void;
  handleUpdateFurniture: (furnitureData: Omit<Furniture, 'id' | 'points'>) => void;
  handleDuplicateFurniture: () => void;
  handleDeleteFurniture: () => void;
}

export const useFurnitureManager = ({
  appState,
  setAppState,
  pushToHistory,
  setSidebarTab,
}: UseFurnitureManagerProps): UseFurnitureManagerReturn => {
  const handleAddFurniture = useCallback((
    furnitureData: Omit<Furniture, 'id' | 'points'>,
  ) => {
    const furnitureId = Date.now().toString();
    const newFurniture: Furniture = {
      ...furnitureData,
      id: furnitureId,
      points: [],
      x: 0, // Reset position for inventory
      y: 0,
    };

    // Add to global inventory
    const updatedInventory = {
      ...appState.furnitureInventory,
      [furnitureId]: newFurniture,
    };

    // Create instance in current floor plan
    const newInstance: FurnitureInstance = {
      furnitureId,
      x: furnitureData.x,
      y: furnitureData.y,
    };

    const newFloorPlan = {
      ...appState.floorPlan,
      furnitureInstances: [
        ...appState.floorPlan.furnitureInstances,
        newInstance,
      ],
    };

    setAppState(prev => ({
      ...prev,
      furnitureInventory: updatedInventory,
      floorPlan: newFloorPlan,
    }));

    pushToHistory(newFloorPlan);
  }, [appState, setAppState, pushToHistory]);

  const handleUpdateFurniture = useCallback((
    furnitureData: Omit<Furniture, 'id' | 'points'>,
  ) => {
    if (!appState.selectedRoomId) return;

    // Update the furniture in the global inventory
    const updatedInventory = {
      ...appState.furnitureInventory,
      [appState.selectedRoomId]: {
        ...appState.furnitureInventory[appState.selectedRoomId],
        ...furnitureData,
        id: appState.selectedRoomId,
        points: [],
        x: 0, // Keep inventory position at 0,0
        y: 0,
      },
    };

    // Update the instance position if x,y changed
    const updatedInstances = appState.floorPlan.furnitureInstances.map(
      instance =>
        instance.furnitureId === appState.selectedRoomId
          ? {
              ...instance,
              x: furnitureData.x,
              y: furnitureData.y,
            }
          : instance,
    );

    const newFloorPlan = {
      ...appState.floorPlan,
      furnitureInstances: updatedInstances,
    };

    setAppState(prev => ({
      ...prev,
      furnitureInventory: updatedInventory,
      floorPlan: newFloorPlan,
    }));

    pushToHistory(newFloorPlan);
  }, [appState, setAppState, pushToHistory]);

  const handleDuplicateFurniture = useCallback(() => {
    if (!appState.selectedRoomId) return;

    // Find the current instance and furniture
    const currentInstance = appState.floorPlan.furnitureInstances.find(
      instance => instance.furnitureId === appState.selectedRoomId,
    );
    const furnitureToClone =
      appState.furnitureInventory[appState.selectedRoomId];

    if (!currentInstance || !furnitureToClone) return;

    // Create new instance (reusing the same furniture from inventory)
    const newInstance: FurnitureInstance = {
      furnitureId: appState.selectedRoomId, // Reuse same furniture
      x: currentInstance.x + 50,
      y: currentInstance.y + 50,
    };

    const newFloorPlan = {
      ...appState.floorPlan,
      furnitureInstances: [
        ...appState.floorPlan.furnitureInstances,
        newInstance,
      ],
    };

    pushToHistory(newFloorPlan);
    setAppState(prev => ({
      ...prev,
      floorPlan: newFloorPlan,
      // Note: We can't select the new instance since it has the same furnitureId
      // This is a limitation of the current selection system
    }));
  }, [appState, pushToHistory, setAppState]);

  const handleDeleteFurniture = useCallback(() => {
    if (!appState.selectedRoomId) return;

    // Remove the instance from current floor plan (but keep in inventory for reuse)
    const newFloorPlan = {
      ...appState.floorPlan,
      furnitureInstances: appState.floorPlan.furnitureInstances.filter(
        instance => instance.furnitureId !== appState.selectedRoomId,
      ),
    };

    pushToHistory(newFloorPlan);
    setAppState(prev => ({
      ...prev,
      selectedRoomId: null,
      floorPlan: newFloorPlan,
    }));
    setSidebarTab(4); // Switch to Add Furniture tab after deletion
  }, [appState, pushToHistory, setAppState, setSidebarTab]);

  return {
    handleAddFurniture,
    handleUpdateFurniture,
    handleDuplicateFurniture,
    handleDeleteFurniture,
  };
};