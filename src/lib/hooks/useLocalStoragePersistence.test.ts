import { renderHook } from '@testing-library/react';
import { useLocalStoragePersistence, initializeStateFromStorage } from './useLocalStoragePersistence';
import { AppState, FloorPlan } from '@/lib/types';

// Mock localStorage and sessionStorage
const createMockStorage = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      storage = {};
    }),
  };
};

const mockLocalStorage = createMockStorage();
const mockSessionStorage = createMockStorage();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

const mockFloorPlan: FloorPlan = {
  name: 'Test Plan',
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
};

const mockAppState: AppState = {
  floorPlan: mockFloorPlan,
  furnitureInventory: {},
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [mockFloorPlan],
  historyIndex: 0,
};

describe('useLocalStoragePersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  test('saves floor plans to localStorage', () => {
    const floorPlans = { 'Test Plan': mockFloorPlan };
    const currentFloorPlanName = 'Test Plan';

    renderHook(() =>
      useLocalStoragePersistence({
        appState: mockAppState,
        floorPlans,
        currentFloorPlanName,
      })
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'floorPlans',
      JSON.stringify(floorPlans)
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'currentFloorPlanName',
      currentFloorPlanName
    );
  });

  test('saves app state to localStorage excluding history', () => {
    const floorPlans = { 'Test Plan': mockFloorPlan };
    const currentFloorPlanName = 'Test Plan';

    renderHook(() =>
      useLocalStoragePersistence({
        appState: mockAppState,
        floorPlans,
        currentFloorPlanName,
      })
    );

    const expectedAppState = {
      floorPlan: mockAppState.floorPlan,
      furnitureInventory: mockAppState.furnitureInventory,
      selectedRoomId: mockAppState.selectedRoomId,
      selectedTool: mockAppState.selectedTool,
      zoom: mockAppState.zoom,
      theme: mockAppState.theme,
      highlightColor: mockAppState.highlightColor,
      wallColor: mockAppState.wallColor,
      gridSize: mockAppState.gridSize,
      gridOpacity: mockAppState.gridOpacity,
    };

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'appState',
      JSON.stringify(expectedAppState)
    );
  });

  test('saves history to sessionStorage', () => {
    const floorPlans = { 'Test Plan': mockFloorPlan };
    const currentFloorPlanName = 'Test Plan';

    renderHook(() =>
      useLocalStoragePersistence({
        appState: mockAppState,
        floorPlans,
        currentFloorPlanName,
      })
    );

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'history',
      JSON.stringify(mockAppState.history)
    );
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'historyIndex',
      mockAppState.historyIndex.toString()
    );
  });

  test('handles sessionStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock sessionStorage.setItem to throw an error
    mockSessionStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });

    const floorPlans = { 'Test Plan': mockFloorPlan };
    const currentFloorPlanName = 'Test Plan';

    expect(() =>
      renderHook(() =>
        useLocalStoragePersistence({
          appState: mockAppState,
          floorPlans,
          currentFloorPlanName,
        })
      )
    ).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Session storage full, clearing old history:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe('initializeStateFromStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  test('returns default state when no saved data exists', () => {
    const result = initializeStateFromStorage();

    expect(result.floorPlans).toEqual({ Untitled: expect.any(Object) });
    expect(result.currentFloorPlanName).toBe('Untitled');
    expect(result.appState.floorPlan.name).toBe('Untitled');
  });

  test('loads saved floor plans from localStorage', () => {
    const savedFloorPlans = { 'My Plan': mockFloorPlan };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'floorPlans') return JSON.stringify(savedFloorPlans);
      if (key === 'currentFloorPlanName') return 'My Plan';
      return null;
    });

    const result = initializeStateFromStorage();

    expect(result.floorPlans).toEqual(savedFloorPlans);
    expect(result.currentFloorPlanName).toBe('My Plan');
  });

  test('loads saved app state from localStorage', () => {
    const savedState = {
      theme: 'dark',
      zoom: 2,
      gridSize: 24,
      floorPlan: mockFloorPlan,
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'appState') return JSON.stringify(savedState);
      return null;
    });

    const result = initializeStateFromStorage();

    expect(result.appState.theme).toBe('dark');
    expect(result.appState.zoom).toBe(2);
    expect(result.appState.gridSize).toBe(24);
  });

  test('loads saved history from sessionStorage', () => {
    const savedHistory = [mockFloorPlan, { ...mockFloorPlan, name: 'Modified' }];
    
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'history') return JSON.stringify(savedHistory);
      if (key === 'historyIndex') return '1';
      return null;
    });

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'appState') return JSON.stringify({ floorPlan: mockFloorPlan });
      return null;
    });

    const result = initializeStateFromStorage();

    expect(result.appState.history).toEqual(savedHistory);
    expect(result.appState.historyIndex).toBe(1);
  });

  test('handles corrupted localStorage data gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'appState') return 'invalid json{';
      return null;
    });

    const result = initializeStateFromStorage();

    expect(result.appState.floorPlan.name).toBe('Untitled');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing saved state:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('handles corrupted history data gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'appState') return JSON.stringify({ floorPlan: mockFloorPlan });
      return null;
    });

    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'history') return 'invalid json{';
      return null;
    });

    const result = initializeStateFromStorage();

    expect(result.appState.history.length).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing saved history, using default:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});