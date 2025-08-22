import { useEffect } from 'react';
import { AppState, FloorPlan } from '@/lib/types';

const INIT_GRID_SIZE = 12;
const MAX_HISTORY_SIZE = 50;

const initialFloorPlan: FloorPlan = {
  name: 'Untitled',
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
};

const initialAppState: AppState = {
  floorPlan: initialFloorPlan,
  furnitureInventory: {},
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: INIT_GRID_SIZE,
  gridOpacity: 0.2,
  history: [initialFloorPlan],
  historyIndex: 0,
};

interface UseLocalStoragePersistenceProps {
  appState: AppState;
  floorPlans: { [key: string]: FloorPlan };
  currentFloorPlanName: string;
}

export const useLocalStoragePersistence = ({
  appState,
  floorPlans,
  currentFloorPlanName,
}: UseLocalStoragePersistenceProps) => {
  // Save floor plans and current name to localStorage
  useEffect(() => {
    localStorage.setItem('floorPlans', JSON.stringify(floorPlans));
    localStorage.setItem('currentFloorPlanName', currentFloorPlanName);
  }, [floorPlans, currentFloorPlanName]);

  // Save app state to localStorage (excluding history)
  useEffect(() => {
    const { history, historyIndex, ...stateToSave } = appState;
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }, [appState]);

  // Save history to sessionStorage with error handling
  useEffect(() => {
    try {
      sessionStorage.setItem('history', JSON.stringify(appState.history));
      sessionStorage.setItem('historyIndex', appState.historyIndex.toString());
    } catch (error) {
      // If sessionStorage is full, clear old history and try again
      console.warn('Session storage full, clearing old history:', error);
      const reducedHistory = appState.history.slice(
        -Math.floor(MAX_HISTORY_SIZE / 2),
      );
      const newHistoryIndex = Math.min(
        appState.historyIndex,
        reducedHistory.length - 1,
      );

      try {
        sessionStorage.setItem('history', JSON.stringify(reducedHistory));
        sessionStorage.setItem('historyIndex', newHistoryIndex.toString());

        // Note: This would need to be handled by the parent component
        // since we can't call setAppState from within a hook like this
        console.log('History reduced, parent should update state');
      } catch (secondError) {
        console.error('Failed to save even reduced history:', secondError);
        // Clear all history as last resort
        sessionStorage.removeItem('history');
        sessionStorage.removeItem('historyIndex');
      }
    }
  }, [appState.history, appState.historyIndex]);
};

// Helper function to initialize state from localStorage
export const initializeStateFromStorage = () => {
  // Initialize floor plans
  const savedFloorPlans = localStorage.getItem('floorPlans');
  const floorPlans = savedFloorPlans
    ? JSON.parse(savedFloorPlans)
    : { Untitled: initialFloorPlan };

  // Initialize current floor plan name
  const savedCurrentName = localStorage.getItem('currentFloorPlanName');
  const currentFloorPlanName = savedCurrentName || 'Untitled';

  // Initialize app state
  const savedState = localStorage.getItem('appState');
  const savedHistory = sessionStorage.getItem('history');
  const savedHistoryIndex = sessionStorage.getItem('historyIndex');

  let appState = initialAppState;

  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      let history = [initialAppState.floorPlan];
      let historyIndex = 0;

      // Try to load history from sessionStorage with size validation
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            // Limit history size on load
            history =
              parsedHistory.length > MAX_HISTORY_SIZE
                ? parsedHistory.slice(-MAX_HISTORY_SIZE)
                : parsedHistory;

            // Adjust history index if history was truncated
            const savedIndex = savedHistoryIndex
              ? parseInt(savedHistoryIndex, 10)
              : 0;
            historyIndex =
              parsedHistory.length > MAX_HISTORY_SIZE
                ? Math.min(savedIndex, history.length - 1)
                : savedIndex;
          }
        } catch (historyError) {
          console.warn(
            'Error parsing saved history, using default:',
            historyError,
          );
          // Clear corrupted history
          sessionStorage.removeItem('history');
          sessionStorage.removeItem('historyIndex');
        }
      }

      // Merge with initial state to ensure all properties exist
      appState = {
        ...initialAppState,
        ...parsedState,
        // Ensure nested objects are also merged
        floorPlan: {
          ...initialAppState.floorPlan,
          ...parsedState.floorPlan,
        },
        history,
        historyIndex,
      };
    } catch (e) {
      console.error('Error parsing saved state:', e);
      appState = initialAppState;
    }
  }

  return {
    floorPlans,
    currentFloorPlanName,
    appState,
  };
};