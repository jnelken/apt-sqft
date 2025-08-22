import { renderHook, act } from '@testing-library/react';
import { useFloorPlanManager } from './useFloorPlanManager';
import { AppState, FloorPlan } from '@/lib/types';

const createMockFloorPlan = (name: string): FloorPlan => ({
  name,
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
});

const createMockAppState = (floorPlan?: FloorPlan): AppState => ({
  floorPlan: floorPlan || createMockFloorPlan('Current'),
  furnitureInventory: {},
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: 12,
  gridOpacity: 0.2,
  history: [floorPlan || createMockFloorPlan('Current')],
  historyIndex: 0,
});

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  readAsDataURL(file: Blob) {
    this.result = 'data:image/png;base64,mockBase64Data';
    setTimeout(() => {
      if (this.onload) {
        this.onload.call(this, { target: this } as any);
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

describe('useFloorPlanManager', () => {
  const defaultProps = {
    floorPlans: { 'Plan 1': createMockFloorPlan('Plan 1') },
    setFloorPlans: jest.fn(),
    currentFloorPlanName: 'Plan 1',
    setCurrentFloorPlanName: jest.fn(),
    appState: createMockAppState(),
    setAppState: jest.fn(),
    pushToHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleFloorPlanSelect saves current plan and loads selected plan', () => {
    const { result } = renderHook(() => useFloorPlanManager(defaultProps));

    const targetPlan = createMockFloorPlan('Plan 2');
    const floorPlans = {
      'Plan 1': createMockFloorPlan('Plan 1'),
      'Plan 2': targetPlan,
    };

    const props = { ...defaultProps, floorPlans };
    const { result: updatedResult } = renderHook(() => useFloorPlanManager(props));

    act(() => {
      updatedResult.current.handleFloorPlanSelect('Plan 2');
    });

    expect(props.setFloorPlans).toHaveBeenCalledWith(expect.any(Function));
    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('Plan 2');
    expect(props.pushToHistory).toHaveBeenCalledWith(targetPlan);
  });

  test('handleNameChange updates floor plan name', () => {
    const { result } = renderHook(() => useFloorPlanManager(defaultProps));

    act(() => {
      result.current.handleNameChange('New Plan Name');
    });

    expect(defaultProps.setFloorPlans).toHaveBeenCalledWith({"New Plan Name": {"backgroundImage": null, "furnitureInstances": [], "imageScale": 1, "name": "New Plan Name", "rooms": []}});
    expect(defaultProps.setCurrentFloorPlanName).toHaveBeenCalledWith('New Plan Name');
    expect(defaultProps.pushToHistory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Plan Name' })
    );
  });

  test('handleNameChange handles duplicate names by updating floor plans object', () => {
    const floorPlans = {
      'Old Name': createMockFloorPlan('Old Name'),
      'Other Plan': createMockFloorPlan('Other Plan'),
    };
    const props = {
      ...defaultProps,
      floorPlans,
      currentFloorPlanName: 'Old Name',
    };

    const { result } = renderHook(() => useFloorPlanManager(props));

    act(() => {
      result.current.handleNameChange('New Name');
    });

    // Should be called with the updated floor plans object
    expect(props.setFloorPlans).toHaveBeenCalled();
    
    // The floor plans should have been updated with the new name
    const setFloorPlansCall = props.setFloorPlans.mock.calls[0][0];
    expect(setFloorPlansCall).toHaveProperty('New Name');
    expect(setFloorPlansCall).not.toHaveProperty('Old Name');
  });

  test('handleDelete removes current floor plan and switches to remaining plan', () => {
    const floorPlans = {
      'Plan 1': createMockFloorPlan('Plan 1'),
      'Plan 2': createMockFloorPlan('Plan 2'),
    };
    const props = {
      ...defaultProps,
      floorPlans,
      currentFloorPlanName: 'Plan 1',
    };

    const { result } = renderHook(() => useFloorPlanManager(props));

    act(() => {
      result.current.handleDelete();
    });

    expect(props.setFloorPlans).toHaveBeenCalledWith({"Plan 2": {"backgroundImage": null, "furnitureInstances": [], "imageScale": 1, "name": "Plan 2", "rooms": []}});
    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('Plan 2');
    expect(props.setAppState).toHaveBeenCalled();
  });

  test('handleDelete creates Untitled plan when no plans remain', () => {
    const floorPlans = { 'Last Plan': createMockFloorPlan('Last Plan') };
    const props = {
      ...defaultProps,
      floorPlans,
      currentFloorPlanName: 'Last Plan',
    };

    const { result } = renderHook(() => useFloorPlanManager(props));

    act(() => {
      result.current.handleDelete();
    });

    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('Untitled');
    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleNewFloorPlan creates unique name and switches to new plan', () => {
    const floorPlans = {
      'Untitled': createMockFloorPlan('Untitled'),
      'Untitled 1': createMockFloorPlan('Untitled 1'),
    };
    const props = { ...defaultProps, floorPlans };

    const { result } = renderHook(() => useFloorPlanManager(props));

    act(() => {
      result.current.handleNewFloorPlan();
    });

    expect(props.setFloorPlans).toHaveBeenCalledTimes(2); // Once to save current, once to add new
    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('Untitled 2');
    expect(props.setAppState).toHaveBeenCalledWith(expect.any(Function));
  });

  test('handleImageUpload processes file and updates floor plan', async () => {
    const mockFile = new File(['mock image'], 'test.png', { type: 'image/png' });
    
    // Create props with floorPlan name 'Untitled' so it gets renamed to file name
    const floorPlan = createMockFloorPlan('Untitled');
    const appState = createMockAppState(floorPlan);
    const props = { ...defaultProps, appState };
    
    const { result } = renderHook(() => useFloorPlanManager(props));

    await act(async () => {
      result.current.handleImageUpload(mockFile);
      // Wait for FileReader to process
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(props.setFloorPlans).toHaveBeenCalled();
    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('test');
    expect(props.setAppState).toHaveBeenCalled();
  });

  test('handleImageUpload uses existing name if not Untitled', async () => {
    const floorPlan = createMockFloorPlan('My Plan');
    const appState = createMockAppState(floorPlan);
    const props = { ...defaultProps, appState };

    const mockFile = new File(['mock image'], 'test.png', { type: 'image/png' });
    const { result } = renderHook(() => useFloorPlanManager(props));

    await act(async () => {
      result.current.handleImageUpload(mockFile);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Should keep the existing name 'My Plan', not use 'test'
    expect(props.setCurrentFloorPlanName).toHaveBeenCalledWith('My Plan');
  });

  test('handleImageScaleChange updates image scale', () => {
    const { result } = renderHook(() => useFloorPlanManager(defaultProps));

    act(() => {
      result.current.handleImageScaleChange(2.5);
    });

    expect(defaultProps.setAppState).toHaveBeenCalledWith(expect.any(Function));

    const setAppStateCall = defaultProps.setAppState.mock.calls[0][0];
    const newState = setAppStateCall(defaultProps.appState);

    expect(newState.floorPlan.imageScale).toBe(2.5);
  });
});
