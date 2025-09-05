import { useCallback } from 'react';
import { Room, AppState } from '@/lib/types';

interface UseRoomManagerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  pushToHistory: (newFloorPlan: any) => void;
  setSidebarTab: React.Dispatch<React.SetStateAction<number>>;
}

interface UseRoomManagerReturn {
  handleAddRoom: (roomData: Omit<Room, 'id' | 'points'>) => void;
  handleUpdateRoom: (roomData: Omit<Room, 'id' | 'points'>) => void;
  handleDeleteRoom: () => void;
  handleDuplicateRoom: () => void;
}

const roundSquareFootage = (width: number, height: number) => {
  return Math.round((width * height) / 144);
};

export const useRoomManager = ({
  appState,
  setAppState,
  pushToHistory,
  setSidebarTab,
}: UseRoomManagerProps): UseRoomManagerReturn => {
  const handleAddRoom = useCallback(
    (roomData: Omit<Room, 'id' | 'points'>) => {
      // Get the editor container dimensions
      const editorContainer = document.querySelector(
        '.LayoutEditor',
      ) as HTMLElement;
      const editorWidth = editorContainer?.offsetWidth;
      const editorHeight = editorContainer?.offsetHeight;

      // Calculate center position by adding half the editor dimensions
      const centeredX = editorWidth / 2 - roomData.width / 2;
      const centeredY = editorHeight / 2 - roomData.height / 2;

      const newRoom: Room = {
        ...roomData,
        id: Date.now().toString(),
        points: [],
        x: centeredX,
        y: centeredY,
        sqFootage: roundSquareFootage(roomData.width, roomData.height),
      };

      setAppState(prev => ({
        ...prev,
        floorPlan: {
          ...prev.floorPlan,
          rooms: [...prev.floorPlan.rooms, newRoom],
        },
      }));
    },
    [setAppState],
  );

  const handleUpdateRoom = useCallback(
    (roomData: Omit<Room, 'id' | 'points'>) => {
      if (!appState.selectedRoomId) return;

      setAppState(prev => ({
        ...prev,
        floorPlan: {
          ...prev.floorPlan,
          rooms: prev.floorPlan.rooms.map(room =>
            room.id === appState.selectedRoomId
              ? {
                  ...room,
                  ...roomData,
                  sqFootage: roundSquareFootage(
                    roomData.width,
                    roomData.height,
                  ),

                  // do not overwrite the x and y values; we have a separate function for that
                  x: room.x,
                  y: room.y,
                }
              : room,
          ),
        },
      }));
    },
    [appState.selectedRoomId, setAppState],
  );

  const handleDeleteRoom = useCallback(() => {
    if (!appState.selectedRoomId) return;

    const newFloorPlan = {
      ...appState.floorPlan,
      rooms: appState.floorPlan.rooms.filter(
        room => room.id !== appState.selectedRoomId,
      ),
    };

    pushToHistory(newFloorPlan);
    setAppState(prev => ({ ...prev, selectedRoomId: null }));
    setSidebarTab(0); // Switch to Add Room tab after deletion
  }, [
    appState.selectedRoomId,
    appState.floorPlan,
    pushToHistory,
    setAppState,
    setSidebarTab,
  ]);

  const handleDuplicateRoom = useCallback(() => {
    if (!appState.selectedRoomId) return;
    const roomToClone = appState.floorPlan.rooms.find(
      room => room.id === appState.selectedRoomId,
    );
    if (!roomToClone) return;

    const newRoom: Room = {
      ...roomToClone,
      id: Date.now().toString(),
      name: `${roomToClone.name} (Copy)`,
      x: roomToClone.x + 50,
      y: roomToClone.y + 50,
      points: [],
    };

    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: [...prev.floorPlan.rooms, newRoom],
      },
      selectedRoomId: newRoom.id,
    }));
  }, [appState.selectedRoomId, appState.floorPlan.rooms, setAppState]);

  return {
    handleAddRoom,
    handleUpdateRoom,
    handleDeleteRoom,
    handleDuplicateRoom,
  };
};
