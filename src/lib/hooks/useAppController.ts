import { useState } from 'react';
import { AppState } from '@/lib/types';
import {
  useLocalStoragePersistence,
  initializeStateFromStorage,
} from '@/lib/hooks/useLocalStoragePersistence';
import { useHistoryManager } from '@/lib/hooks/useHistoryManager';
import { useFloorPlanManager } from '@/lib/hooks/useFloorPlanManager';
import { useRoomManager } from '@/lib/hooks/useRoomManager';
import { useFurnitureManager } from '@/lib/hooks/useFurnitureManager';
import { useItemSelection } from '@/lib/hooks/useItemSelection';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useAppSettings } from '@/lib/hooks/useAppSettings';
import { useEditorMode } from '@/lib/hooks/useEditorMode';

/** Owns the app's top-level state and composes the manager hooks `App` renders from. */
export const useAppController = () => {
  // Initialize state from localStorage/sessionStorage
  const {
    floorPlans: initialFloorPlans,
    currentFloorPlanName: initialCurrentName,
    appState: initialAppState,
  } = initializeStateFromStorage();

  const [floorPlans, setFloorPlans] = useState(initialFloorPlans);
  const [currentFloorPlanName, setCurrentFloorPlanName] =
    useState(initialCurrentName);
  const [appState, setAppState] = useState(initialAppState);
  const [sidebarTab, setSidebarTab] = useState(0);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  useLocalStoragePersistence({ appState, floorPlans, currentFloorPlanName });

  const history = useHistoryManager({ appState, setAppState });
  const { pushToHistory } = history;

  const floorPlanManager = useFloorPlanManager({
    floorPlans,
    setFloorPlans,
    currentFloorPlanName,
    setCurrentFloorPlanName,
    appState,
    setAppState,
    pushToHistory,
  });

  // Only keep delete functions for keyboard shortcuts
  const { handleDeleteRoom } = useRoomManager({
    appState,
    setAppState,
    pushToHistory,
    setSidebarTab,
  });

  const { handleDeleteFurniture } = useFurnitureManager({
    appState,
    setAppState,
    pushToHistory,
    setSidebarTab,
  });

  const selection = useItemSelection({
    appState,
    setAppState,
    setSidebarTab,
    pushToHistory,
    handleDeleteRoom,
    handleDeleteFurniture,
  });

  const settings = useAppSettings({ appState, setAppState });

  useKeyboardShortcuts({
    handleUndo: history.handleUndo,
    handleRedo: history.handleRedo,
    handleDeleteSelected: selection.handleDeleteSelected,
  });

  const { editorMode, setEditorMode } = useEditorMode();

  return {
    ...history,
    ...floorPlanManager,
    ...selection,
    ...settings,
    floorPlans,
    currentFloorPlanName,
    appState,
    setAppState,
    sidebarTab,
    setSidebarTab,
    isLeftPanelOpen,
    toggleLeftPanel: () => setIsLeftPanelOpen(!isLeftPanelOpen),
    handleToolChange: (tool: AppState['selectedTool']) =>
      setAppState((prev) => ({ ...prev, selectedTool: tool })),
    editorMode,
    setEditorMode,
  };
};
