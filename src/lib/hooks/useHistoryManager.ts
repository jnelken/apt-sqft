import { useCallback } from 'react';
import { FloorPlan, AppState } from '@/lib/types';

const MAX_HISTORY_SIZE = 50;

interface UseHistoryManagerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface UseHistoryManagerReturn {
  pushToHistory: (newFloorPlan: FloorPlan) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryManager = ({
  appState,
  setAppState,
}: UseHistoryManagerProps): UseHistoryManagerReturn => {
  const pushToHistory = useCallback((newFloorPlan: FloorPlan) => {
    setAppState(prev => {
      // Remove any future history if we're not at the end
      let newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newFloorPlan);

      // Limit history size to prevent session storage overflow
      if (newHistory.length > MAX_HISTORY_SIZE) {
        const oldLength = newHistory.length;
        // Remove oldest entries, keeping the most recent MAX_HISTORY_SIZE entries
        newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
        console.log(
          `History trimmed from ${oldLength} to ${newHistory.length} entries`,
        );
      }

      return {
        ...prev,
        floorPlan: newFloorPlan,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [setAppState]);

  const handleUndo = useCallback(() => {
    setAppState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          floorPlan: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, [setAppState]);

  const handleRedo = useCallback(() => {
    setAppState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          floorPlan: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, [setAppState]);

  // Computed values for button states
  const canUndo = appState.historyIndex > 0;
  const canRedo = appState.historyIndex < appState.history.length - 1;

  return {
    pushToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  };
};