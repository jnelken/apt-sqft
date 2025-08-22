import { renderHook, act } from '@testing-library/react';
import { useItemSelection } from './useItemSelection';
import { AppState, Room, Furniture, FurnitureInstance, FloorPlan } from '@/lib/types';

const createMockRoom = (id: string, name: string, x: number = 100, y: number = 100): Room => ({
  id,
  name,
  height: 120,
  width: 144,
  sqFootage: 120,
  livability: 'livable',
  points: [],
  x,
  y,
});

const createMockFurniture = (id: string, name: string): Furniture => ({
  id,
  name,
  height: 60,
  width: 80,
  sqFootage: 33,
  livability: 'livable',
  points: [],
  x: 0,
  y: 0,
  type: 'seating',
  color: '#ffffff',
});

const createMockFurnitureInstance = (furnitureId: string, x: number = 200, y: number = 200): FurnitureInstance => ({
  furnitureId,
  x,
  y,
});

const createMockFloorPlan = (
  rooms: Room[] = [],
  furnitureInstances: FurnitureInstance[] = []
): FloorPlan => ({
  name: 'Test Plan',
  rooms,
  furnitureInstances,
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (
  rooms: Room[] = [],
  furnitureInstances: FurnitureInstance[] = [],
  furnitureInventory: { [key: string]: Furniture } = {},
  selectedRoomId: string | null = null
): AppState => ({
  floorPlan: createMockFloorPlan(rooms, furnitureInstances),
  furnitureInventory,
  selectedRoomId,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [createMockFloorPlan(rooms, furnitureInstances)],
  historyIndex: 0,
});

describe('useItemSelection', () => {
  const defaultProps = {
    appState: createMockAppState(),
    setAppState: jest.fn(),
    setSidebarTab: jest.fn(),
    pushToHistory: jest.fn(),
    handleDeleteRoom: jest.fn(),
    handleDeleteFurniture: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selectedRoom returns correct room when selected', () => {
    const room = createMockRoom('room1', 'Living Room');
    const appState = createMockAppState([room], [], {}, 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    expect(result.current.selectedRoom).toEqual(room);
  });

  test('selectedFurniture returns correct furniture when selected', () => {
    const furniture = createMockFurniture('furniture1', 'Sofa');
    const instance = createMockFurnitureInstance('furniture1', 300, 400);
    const appState = createMockAppState([], [instance], { furniture1: furniture }, 'furniture1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    expect(result.current.selectedFurniture).toEqual({
      ...furniture,
      x: 300,
      y: 400,
    });
  });

  test('handleRoomSelect updates selected room and switches to details tab', () => {
    const { result } = renderHook(() => useItemSelection(defaultProps));

    act(() => {
      result.current.handleRoomSelect('room1');
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(defaultProps.setSidebarTab).toHaveBeenCalledWith(1);

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    expect(newState.selectedRoomId).toBe('room1');
  });

  test('handleRoomSelect clears selection when passed null', () => {
    const { result } = renderHook(() => useItemSelection(defaultProps));

    act(() => {
      result.current.handleRoomSelect(null);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(defaultProps.setSidebarTab).not.toHaveBeenCalled();

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    expect(newState.selectedRoomId).toBeNull();
  });

  test('handleRoomMove updates room position during dragging', () => {
    const room = createMockRoom('room1', 'Living Room', 100, 100);
    const appState = createMockAppState([room]);
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleRoomMove('room1', 200, 300, true); // isDragging = true
    });

    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(props.pushToHistory).not.toHaveBeenCalled(); // No history during drag

    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    const updatedRoom = newState.floorPlan.rooms[0];
    
    expect(updatedRoom.x).toBe(200);
    expect(updatedRoom.y).toBe(300);
  });

  test('handleRoomMove pushes to history when dragging ends', () => {
    const room = createMockRoom('room1', 'Living Room', 100, 100);
    const appState = createMockAppState([room]);
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleRoomMove('room1', 200, 300, false); // isDragging = false
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    
    const pushToHistoryCall = props.pushToHistory.mock.calls[0][0];
    const updatedRoom = pushToHistoryCall.rooms[0];
    expect(updatedRoom.x).toBe(200);
    expect(updatedRoom.y).toBe(300);
  });

  test('handleRoomMove updates furniture instance position', () => {
    const furniture = createMockFurniture('furniture1', 'Sofa');
    const instance = createMockFurnitureInstance('furniture1', 100, 100);
    const appState = createMockAppState([], [instance], { furniture1: furniture });
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleRoomMove('furniture1', 250, 350, false);
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    
    const pushToHistoryCall = props.pushToHistory.mock.calls[0][0];
    const updatedInstance = pushToHistoryCall.furnitureInstances[0];
    expect(updatedInstance.x).toBe(250);
    expect(updatedInstance.y).toBe(350);
  });

  test('handleRoomResize updates room dimensions', () => {
    const room = createMockRoom('room1', 'Living Room');
    const appState = createMockAppState([room]);
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleRoomResize('room1', 200, 150, false);
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    
    const pushToHistoryCall = props.pushToHistory.mock.calls[0][0];
    const updatedRoom = pushToHistoryCall.rooms[0];
    expect(updatedRoom.width).toBe(200);
    expect(updatedRoom.height).toBe(150);
  });

  test('handleRoomResize updates furniture inventory dimensions', () => {
    const furniture = createMockFurniture('furniture1', 'Sofa');
    const instance = createMockFurnitureInstance('furniture1');
    const appState = createMockAppState([], [instance], { furniture1: furniture });
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleRoomResize('furniture1', 100, 70, false);
    });

    expect(props.setAppState).toHaveBeenCalled(); // For inventory update
    expect(props.pushToHistory).toHaveBeenCalled();

    const firstSetAppStateCall = props.setAppState.mock.calls[0][0];
    const stateWithUpdatedInventory = firstSetAppStateCall(props.appState);
    const updatedFurniture = stateWithUpdatedInventory.furnitureInventory['furniture1'];
    
    expect(updatedFurniture.width).toBe(100);
    expect(updatedFurniture.height).toBe(70);
  });

  test('handleSwapDimensions swaps room dimensions', () => {
    const room = createMockRoom('room1', 'Living Room');
    room.width = 144;
    room.height = 120;
    const appState = createMockAppState([room], [], {}, 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleSwapDimensions();
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    
    const pushToHistoryCall = props.pushToHistory.mock.calls[0][0];
    const updatedRoom = pushToHistoryCall.rooms[0];
    expect(updatedRoom.width).toBe(120); // Original height
    expect(updatedRoom.height).toBe(144); // Original width
  });

  test('handleSwapDimensions swaps furniture dimensions', () => {
    const furniture = createMockFurniture('furniture1', 'Sofa');
    furniture.width = 80;
    furniture.height = 60;
    const instance = createMockFurnitureInstance('furniture1');
    const appState = createMockAppState([], [instance], { furniture1: furniture }, 'furniture1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleSwapDimensions();
    });

    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(props.pushToHistory).toHaveBeenCalled();

    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    const updatedFurniture = newState.furnitureInventory['furniture1'];
    
    expect(updatedFurniture.width).toBe(60); // Original height
    expect(updatedFurniture.height).toBe(80); // Original width
  });

  test('handleDeleteSelected calls handleDeleteRoom for rooms', () => {
    const room = createMockRoom('room1', 'Living Room');
    const appState = createMockAppState([room], [], {}, 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleDeleteSelected();
    });

    expect(props.handleDeleteRoom).toHaveBeenCalled();
    expect(props.handleDeleteFurniture).not.toHaveBeenCalled();
  });

  test('handleDeleteSelected calls handleDeleteFurniture for furniture', () => {
    const furniture = createMockFurniture('furniture1', 'Sofa');
    const instance = createMockFurnitureInstance('furniture1');
    const appState = createMockAppState([], [instance], { furniture1: furniture }, 'furniture1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useItemSelection(props));

    act(() => {
      result.current.handleDeleteSelected();
    });

    expect(props.handleDeleteFurniture).toHaveBeenCalled();
    expect(props.handleDeleteRoom).not.toHaveBeenCalled();
  });

  test('handleTabChange updates sidebar tab and clears selection for Add Room tab', () => {
    const { result } = renderHook(() => useItemSelection(defaultProps));

    const mockEvent = {} as React.SyntheticEvent;

    act(() => {
      result.current.handleTabChange(mockEvent, 0); // Add Room tab
    });

    expect(defaultProps.setSidebarTab).toHaveBeenCalledWith(0);
    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    expect(newState.selectedRoomId).toBeNull();
  });

  test('handleTabChange does not clear selection for other tabs', () => {
    const { result } = renderHook(() => useItemSelection(defaultProps));

    const mockEvent = {} as React.SyntheticEvent;

    act(() => {
      result.current.handleTabChange(mockEvent, 1); // Room Details tab
    });

    expect(defaultProps.setSidebarTab).toHaveBeenCalledWith(1);
    expect(defaultProps.setAppState).not.toHaveBeenCalled();
  });
});