import { renderHook, act } from '@testing-library/react';
import { useRoomManager } from './useRoomManager';
import { AppState, Room, FloorPlan } from '@/lib/types';

// Mock document.querySelector for LayoutEditor
const mockEditorElement = {
  offsetWidth: 800,
  offsetHeight: 600,
};

Object.defineProperty(document, 'querySelector', {
  value: jest.fn((selector) => {
    if (selector === '.LayoutEditor') {
      return mockEditorElement;
    }
    return null;
  }),
});

const createMockRoom = (id: string, name: string): Room => ({
  id,
  name,
  height: 120,
  width: 144,
  sqFootage: 120,
  livability: 'livable',
  points: [],
  x: 100,
  y: 100,
});

const createMockFloorPlan = (rooms: Room[] = []): FloorPlan => ({
  name: 'Test Plan',
  rooms,
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (rooms: Room[] = [], selectedRoomId: string | null = null): AppState => ({
  floorPlan: createMockFloorPlan(rooms),
  furnitureInventory: {},
  selectedRoomId,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [createMockFloorPlan(rooms)],
  historyIndex: 0,
});

// Mock Date.now for consistent IDs
const mockDateNow = jest.spyOn(Date, 'now');

describe('useRoomManager', () => {
  const defaultProps = {
    appState: createMockAppState(),
    setAppState: jest.fn(),
    pushToHistory: jest.fn(),
    setSidebarTab: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(12345);
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  test('handleAddRoom creates new room with centered position', () => {
    const { result } = renderHook(() => useRoomManager(defaultProps));

    const roomData = {
      name: 'Living Room',
      height: 120,
      width: 144,
      sqFootage: 120,
      livability: 'livable' as const,
      x: 0,
      y: 0,
    };

    act(() => {
      result.current.handleAddRoom(roomData);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));
    
    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    const addedRoom = newState.floorPlan.rooms[0];
    expect(addedRoom).toEqual({
      ...roomData,
      id: '12345',
      points: [],
      x: 328, // (800 / 2) - (144 / 2)
      y: 240, // (600 / 2) - (120 / 2)
      sqFootage: 120, // Math.round((144 * 120) / 144)
    });
  });

  test('handleAddRoom calculates square footage correctly', () => {
    const { result } = renderHook(() => useRoomManager(defaultProps));

    const roomData = {
      name: 'Bedroom',
      height: 150,
      width: 200,
      sqFootage: 0, // This should be recalculated
      livability: 'livable' as const,
      x: 0,
      y: 0,
    };

    act(() => {
      result.current.handleAddRoom(roomData);
    });

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    const addedRoom = newState.floorPlan.rooms[0];
    
    expect(addedRoom.sqFootage).toBe(208); // Math.round((200 * 150) / 144)
  });

  test('handleUpdateRoom updates existing room', () => {
    const existingRoom = createMockRoom('room1', 'Old Name');
    const appState = createMockAppState([existingRoom], 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useRoomManager(props));

    const updatedData = {
      name: 'New Name',
      height: 180,
      width: 160,
      sqFootage: 0,
      livability: 'non-livable' as const,
      x: 200,
      y: 200,
    };

    act(() => {
      result.current.handleUpdateRoom(updatedData);
    });

    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    
    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    
    const updatedRoom = newState.floorPlan.rooms[0];
    expect(updatedRoom).toEqual({
      ...existingRoom,
      ...updatedData,
      sqFootage: 200, // Math.round((160 * 180) / 144)
    });
  });

  test('handleUpdateRoom does nothing when no room selected', () => {
    const { result } = renderHook(() => useRoomManager(defaultProps));

    const updatedData = {
      name: 'New Name',
      height: 180,
      width: 160,
      sqFootage: 0,
      livability: 'livable' as const,
      x: 200,
      y: 200,
    };

    act(() => {
      result.current.handleUpdateRoom(updatedData);
    });

    expect(defaultProps.setAppState).not.toHaveBeenCalled();
  });

  test('handleDeleteRoom removes room and updates history', () => {
    const existingRoom = createMockRoom('room1', 'Room to Delete');
    const appState = createMockAppState([existingRoom], 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useRoomManager(props));

    act(() => {
      result.current.handleDeleteRoom();
    });

    expect(props.pushToHistory).toHaveBeenCalledWith({
      ...props.appState.floorPlan,
      rooms: [],
    });
    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(props.setSidebarTab).toHaveBeenCalledWith(0);

    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    expect(newState.selectedRoomId).toBeNull();
  });

  test('handleDeleteRoom does nothing when no room selected', () => {
    const { result } = renderHook(() => useRoomManager(defaultProps));

    act(() => {
      result.current.handleDeleteRoom();
    });

    expect(defaultProps.pushToHistory).not.toHaveBeenCalled();
    expect(defaultProps.setAppState).not.toHaveBeenCalled();
    expect(defaultProps.setSidebarTab).not.toHaveBeenCalled();
  });

  test('handleDuplicateRoom creates copy of selected room', () => {
    const existingRoom = createMockRoom('room1', 'Original Room');
    const appState = createMockAppState([existingRoom], 'room1');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useRoomManager(props));

    act(() => {
      result.current.handleDuplicateRoom();
    });

    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    
    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    
    expect(newState.floorPlan.rooms).toHaveLength(2);
    
    const duplicatedRoom = newState.floorPlan.rooms[1];
    expect(duplicatedRoom).toEqual({
      ...existingRoom,
      id: '12345',
      name: 'Original Room (Copy)',
      x: 150, // original x + 50
      y: 150, // original y + 50
      points: [],
    });
    
    expect(newState.selectedRoomId).toBe('12345');
  });

  test('handleDuplicateRoom does nothing when no room selected', () => {
    const { result } = renderHook(() => useRoomManager(defaultProps));

    act(() => {
      result.current.handleDuplicateRoom();
    });

    expect(defaultProps.setAppState).not.toHaveBeenCalled();
  });

  test('handleDuplicateRoom does nothing when selected room not found', () => {
    const existingRoom = createMockRoom('room1', 'Existing Room');
    const appState = createMockAppState([existingRoom], 'nonexistent-room');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useRoomManager(props));

    act(() => {
      result.current.handleDuplicateRoom();
    });

    expect(props.setAppState).not.toHaveBeenCalled();
  });
});