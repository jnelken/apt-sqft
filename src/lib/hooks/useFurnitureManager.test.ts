import { renderHook, act } from '@testing-library/react';
import { useFurnitureManager } from './useFurnitureManager';
import { AppState, Furniture, FurnitureInstance, FloorPlan } from '@/lib/types';

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

const createMockFurnitureInstance = (furnitureId: string, x: number = 100, y: number = 100): FurnitureInstance => ({
  furnitureId,
  x,
  y,
});

const createMockFloorPlan = (furnitureInstances: FurnitureInstance[] = []): FloorPlan => ({
  name: 'Test Plan',
  rooms: [],
  furnitureInstances,
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (
  furnitureInstances: FurnitureInstance[] = [],
  furnitureInventory: { [key: string]: Furniture } = {},
  selectedRoomId: string | null = null
): AppState => ({
  floorPlan: createMockFloorPlan(furnitureInstances),
  furnitureInventory,
  selectedRoomId,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [createMockFloorPlan(furnitureInstances)],
  historyIndex: 0,
});

// Mock Date.now for consistent IDs
const mockDateNow = jest.spyOn(Date, 'now');

describe('useFurnitureManager', () => {
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

  test('handleAddFurniture creates new furniture and instance', () => {
    const { result } = renderHook(() => useFurnitureManager(defaultProps));

    const furnitureData = {
      name: 'Sofa',
      height: 80,
      width: 120,
      sqFootage: 67,
      livability: 'livable' as const,
      x: 200,
      y: 150,
      type: 'seating',
      color: '#ff0000',
    };

    act(() => {
      result.current.handleAddFurniture(furnitureData);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(defaultProps.pushToHistory).toHaveBeenCalled();
    
    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    // Check furniture was added to inventory
    expect(newState.furnitureInventory['12345']).toEqual({
      ...furnitureData,
      id: '12345',
      points: [],
      x: 0, // Reset for inventory
      y: 0, // Reset for inventory
    });
    
    // Check instance was created in floor plan
    expect(newState.floorPlan.furnitureInstances[0]).toEqual({
      furnitureId: '12345',
      x: 200, // Original position
      y: 150, // Original position
    });
    
    // Check pushToHistory was called with new floor plan
    expect(defaultProps.pushToHistory).toHaveBeenCalledWith(newState.floorPlan);
  });

  test('handleUpdateFurniture updates existing furniture and instance', () => {
    const existingFurniture = createMockFurniture('furniture1', 'Old Sofa');
    const existingInstance = createMockFurnitureInstance('furniture1', 100, 100);
    
    const appState = createMockAppState(
      [existingInstance],
      { furniture1: existingFurniture },
      'furniture1'
    );
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useFurnitureManager(props));

    const updatedData = {
      name: 'New Sofa',
      height: 90,
      width: 140,
      sqFootage: 87,
      livability: 'non-livable' as const,
      x: 250,
      y: 200,
      type: 'storage',
      color: '#00ff00',
    };

    act(() => {
      result.current.handleUpdateFurniture(updatedData);
    });

    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(props.pushToHistory).toHaveBeenCalled();
    
    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    
    // Check furniture was updated in inventory
    expect(newState.furnitureInventory['furniture1']).toEqual({
      ...updatedData,
      id: 'furniture1',
      points: [],
      x: 0, // Keep inventory position at 0,0
      y: 0,
    });
    
    // Check instance position was updated
    expect(newState.floorPlan.furnitureInstances[0]).toEqual({
      furnitureId: 'furniture1',
      x: 250,
      y: 200,
    });
  });

  test('handleUpdateFurniture does nothing when no furniture selected', () => {
    const { result } = renderHook(() => useFurnitureManager(defaultProps));

    const updatedData = {
      name: 'New Sofa',
      height: 90,
      width: 140,
      sqFootage: 87,
      livability: 'livable' as const,
      x: 250,
      y: 200,
      type: 'storage',
      color: '#00ff00',
    };

    act(() => {
      result.current.handleUpdateFurniture(updatedData);
    });

    expect(defaultProps.setAppState).not.toHaveBeenCalled();
    expect(defaultProps.pushToHistory).not.toHaveBeenCalled();
  });

  test('handleDuplicateFurniture creates new instance of existing furniture', () => {
    const existingFurniture = createMockFurniture('furniture1', 'Original Sofa');
    const existingInstance = createMockFurnitureInstance('furniture1', 100, 100);
    
    const appState = createMockAppState(
      [existingInstance],
      { furniture1: existingFurniture },
      'furniture1'
    );
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useFurnitureManager(props));

    act(() => {
      result.current.handleDuplicateFurniture();
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    
    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    
    // Should have 2 instances of the same furniture
    expect(newState.floorPlan.furnitureInstances).toHaveLength(2);
    
    const newInstance = newState.floorPlan.furnitureInstances[1];
    expect(newInstance).toEqual({
      furnitureId: 'furniture1', // Same furniture ID
      x: 150, // Original x + 50
      y: 150, // Original y + 50
    });
    
    // Furniture inventory should remain unchanged
    expect(newState.furnitureInventory).toEqual(props.appState.furnitureInventory);
  });

  test('handleDuplicateFurniture does nothing when no furniture selected', () => {
    const { result } = renderHook(() => useFurnitureManager(defaultProps));

    act(() => {
      result.current.handleDuplicateFurniture();
    });

    expect(defaultProps.pushToHistory).not.toHaveBeenCalled();
    expect(defaultProps.setAppState).not.toHaveBeenCalled();
  });

  test('handleDuplicateFurniture does nothing when selected furniture not found', () => {
    const appState = createMockAppState([], {}, 'nonexistent-furniture');
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useFurnitureManager(props));

    act(() => {
      result.current.handleDuplicateFurniture();
    });

    expect(props.pushToHistory).not.toHaveBeenCalled();
    expect(props.setAppState).not.toHaveBeenCalled();
  });

  test('handleDeleteFurniture removes instance but keeps furniture in inventory', () => {
    const existingFurniture = createMockFurniture('furniture1', 'Sofa to Delete');
    const existingInstance = createMockFurnitureInstance('furniture1', 100, 100);
    
    const appState = createMockAppState(
      [existingInstance],
      { furniture1: existingFurniture },
      'furniture1'
    );
    const props = { ...defaultProps, appState };

    const { result } = renderHook(() => useFurnitureManager(props));

    act(() => {
      result.current.handleDeleteFurniture();
    });

    expect(props.pushToHistory).toHaveBeenCalled();
    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
    expect(props.setSidebarTab).toHaveBeenCalledWith(4);
    
    const pushToHistoryCall = props.pushToHistory.mock.calls[0][0];
    expect(pushToHistoryCall.furnitureInstances).toHaveLength(0);
    
    const setAppStateCall = props.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(props.appState);
    
    expect(newState.selectedRoomId).toBeNull();
    expect(newState.floorPlan.furnitureInstances).toHaveLength(0);
  });

  test('handleDeleteFurniture does nothing when no furniture selected', () => {
    const { result } = renderHook(() => useFurnitureManager(defaultProps));

    act(() => {
      result.current.handleDeleteFurniture();
    });

    expect(defaultProps.pushToHistory).not.toHaveBeenCalled();
    expect(defaultProps.setAppState).not.toHaveBeenCalled();
    expect(defaultProps.setSidebarTab).not.toHaveBeenCalled();
  });
});