import { renderHook, act } from '@testing-library/react';
import { useHistoryManager } from './useHistoryManager';
import { AppState, FloorPlan } from '@/lib/types';

const createMockFloorPlan = (name: string): FloorPlan => ({
  name,
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (historyIndex: number = 0, history?: FloorPlan[]): AppState => {
  const defaultHistory = [createMockFloorPlan('Initial')];
  return {
    floorPlan: createMockFloorPlan('Current'),
    furnitureInventory: {},
    selectedRoomId: null,
    selectedTool: 'select',
    zoom: 1,
    theme: 'light',
    highlightColor: '#377c7c',
    wallColor: '#377c7c',
    gridSize: 12,
    gridOpacity: 0.2,
    history: history || defaultHistory,
    historyIndex,
  };
};

describe('useHistoryManager', () => {
  test('pushToHistory adds new floor plan to history', () => {
    const mockAppState = createMockAppState();
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    const newFloorPlan = createMockFloorPlan('New Plan');

    act(() => {
      result.current.pushToHistory(newFloorPlan);
    });

    expect(mockSetAppState).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the state update function
    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    expect(newState.history).toHaveLength(2);
    expect(newState.history[1]).toBe(newFloorPlan);
    expect(newState.historyIndex).toBe(1);
    expect(newState.floorPlan).toBe(newFloorPlan);
  });

  test('pushToHistory removes future history when not at end', () => {
    const history = [
      createMockFloorPlan('First'),
      createMockFloorPlan('Second'),
      createMockFloorPlan('Third'),
    ];
    const mockAppState = createMockAppState(1, history); // At middle of history
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    const newFloorPlan = createMockFloorPlan('New Plan');

    act(() => {
      result.current.pushToHistory(newFloorPlan);
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    // Should have first, second, and new plan (third removed)
    expect(newState.history).toHaveLength(3);
    expect(newState.history[2]).toBe(newFloorPlan);
    expect(newState.historyIndex).toBe(2);
  });

  test('pushToHistory limits history size', () => {
    // Create a history that would exceed MAX_HISTORY_SIZE (50)
    const largeHistory = Array.from({ length: 50 }, (_, i) =>
      createMockFloorPlan(`Plan ${i}`)
    );
    const mockAppState = createMockAppState(49, largeHistory);
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    const newFloorPlan = createMockFloorPlan('New Plan');

    act(() => {
      result.current.pushToHistory(newFloorPlan);
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    // Should still be at max size
    expect(newState.history).toHaveLength(50);
    // Should contain the new plan as the last item
    expect(newState.history[49]).toBe(newFloorPlan);
    expect(newState.historyIndex).toBe(49);
  });

  test('handleUndo moves back in history', () => {
    const history = [
      createMockFloorPlan('First'),
      createMockFloorPlan('Second'),
    ];
    const mockAppState = createMockAppState(1, history);
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    act(() => {
      result.current.handleUndo();
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    expect(newState.historyIndex).toBe(0);
    expect(newState.floorPlan).toBe(history[0]);
  });

  test('handleUndo does nothing when at beginning of history', () => {
    const mockAppState = createMockAppState(0); // At beginning
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    act(() => {
      result.current.handleUndo();
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    expect(newState).toBe(mockAppState); // No change
  });

  test('handleRedo moves forward in history', () => {
    const history = [
      createMockFloorPlan('First'),
      createMockFloorPlan('Second'),
    ];
    const mockAppState = createMockAppState(0, history);
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    act(() => {
      result.current.handleRedo();
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    expect(newState.historyIndex).toBe(1);
    expect(newState.floorPlan).toBe(history[1]);
  });

  test('handleRedo does nothing when at end of history', () => {
    const history = [
      createMockFloorPlan('First'),
      createMockFloorPlan('Second'),
    ];
    const mockAppState = createMockAppState(1, history); // At end
    const mockSetAppState = jest.fn();

    const { result } = renderHook(() =>
      useHistoryManager({ appState: mockAppState, setAppState: mockSetAppState })
    );

    act(() => {
      result.current.handleRedo();
    });

    const stateUpdateFn = mockSetAppState.mock.calls[0][0];
    const newState = stateUpdateFn(mockAppState);
    
    expect(newState).toBe(mockAppState); // No change
  });

  test('canUndo and canRedo return correct values', () => {
    const history = [
      createMockFloorPlan('First'),
      createMockFloorPlan('Second'),
      createMockFloorPlan('Third'),
    ];

    // Test at beginning
    const mockAppStateBeginning = createMockAppState(0, history);
    const { result: resultBeginning } = renderHook(() =>
      useHistoryManager({ appState: mockAppStateBeginning, setAppState: jest.fn() })
    );
    
    expect(resultBeginning.current.canUndo).toBe(false);
    expect(resultBeginning.current.canRedo).toBe(true);

    // Test in middle
    const mockAppStateMiddle = createMockAppState(1, history);
    const { result: resultMiddle } = renderHook(() =>
      useHistoryManager({ appState: mockAppStateMiddle, setAppState: jest.fn() })
    );
    
    expect(resultMiddle.current.canUndo).toBe(true);
    expect(resultMiddle.current.canRedo).toBe(true);

    // Test at end
    const mockAppStateEnd = createMockAppState(2, history);
    const { result: resultEnd } = renderHook(() =>
      useHistoryManager({ appState: mockAppStateEnd, setAppState: jest.fn() })
    );
    
    expect(resultEnd.current.canUndo).toBe(true);
    expect(resultEnd.current.canRedo).toBe(false);
  });
});