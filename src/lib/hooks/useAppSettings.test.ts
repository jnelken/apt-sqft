import { renderHook, act } from '@testing-library/react';
import { useAppSettings } from './useAppSettings';
import { AppState, FloorPlan } from '@/lib/types';

const createMockFloorPlan = (): FloorPlan => ({
  name: 'Test Plan',
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (): AppState => ({
  floorPlan: createMockFloorPlan(),
  furnitureInventory: {},
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [createMockFloorPlan()],
  historyIndex: 0,
});

describe('useAppSettings', () => {
  const defaultProps = {
    appState: createMockAppState(),
    setAppState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleGridSizeChange updates grid size', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleGridSizeChange(24);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.gridSize).toBe(24);
    expect(newState).toEqual({
      ...defaultProps.appState,
      gridSize: 24,
    });
  });

  test('handleGridOpacityChange updates grid opacity', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleGridOpacityChange(0.5);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.gridOpacity).toBe(0.5);
  });

  test('handleZoomChange updates zoom level', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleZoomChange(2.0);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.zoom).toBe(2.0);
  });

  test('handleThemeChange updates theme', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleThemeChange('dark');
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.theme).toBe('dark');
  });

  test('handleWallColorChange updates wall color', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleWallColorChange('#ff0000');
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.wallColor).toBe('#ff0000');
  });

  test('handleHighlightColorChange updates highlight color', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleHighlightColorChange('#00ff00');
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    expect(newState.highlightColor).toBe('#00ff00');
  });

  test('all handlers preserve other state properties', () => {
    const { result } = renderHook(() => useAppSettings(defaultProps));

    act(() => {
      result.current.handleGridSizeChange(20);
    });

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);
    
    // Verify that only gridSize changed, everything else is preserved
    expect(newState).toEqual({
      ...defaultProps.appState,
      gridSize: 20,
    });
    
    expect(newState.zoom).toBe(defaultProps.appState.zoom);
    expect(newState.theme).toBe(defaultProps.appState.theme);
    expect(newState.highlightColor).toBe(defaultProps.appState.highlightColor);
    expect(newState.wallColor).toBe(defaultProps.appState.wallColor);
    expect(newState.gridOpacity).toBe(defaultProps.appState.gridOpacity);
    expect(newState.floorPlan).toBe(defaultProps.appState.floorPlan);
    expect(newState.furnitureInventory).toBe(defaultProps.appState.furnitureInventory);
  });

  test('handlers are memoized and stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAppSettings(defaultProps));

    const firstHandlers = result.current;
    
    // Trigger a re-render
    rerender();
    
    const secondHandlers = result.current;

    // All handlers should be the same reference (memoized)
    expect(firstHandlers.handleGridSizeChange).toBe(secondHandlers.handleGridSizeChange);
    expect(firstHandlers.handleGridOpacityChange).toBe(secondHandlers.handleGridOpacityChange);
    expect(firstHandlers.handleZoomChange).toBe(secondHandlers.handleZoomChange);
    expect(firstHandlers.handleThemeChange).toBe(secondHandlers.handleThemeChange);
    expect(firstHandlers.handleWallColorChange).toBe(secondHandlers.handleWallColorChange);
    expect(firstHandlers.handleHighlightColorChange).toBe(secondHandlers.handleHighlightColorChange);
  });
});