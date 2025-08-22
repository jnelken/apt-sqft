'use client';

import React, { useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { FloorPlanTabs } from '@/components/FloorPlanTabs';
import { MainToolbar } from '@/components/MainToolbar';
import { LeftPanel } from '@/components/LeftPanel';
import { MainContent } from '@/components/MainContent';
import { RightSidebar } from '@/components/RightSidebar';
import { FurnitureInventory, FurnitureInstance, Furniture } from '@/lib/types';

// Import custom hooks
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

// Helper function to get furniture objects from instances
const getFurnitureFromInstances = (
  instances: FurnitureInstance[],
  inventory: FurnitureInventory,
): Furniture[] => {
  return instances
    .map(instance => {
      const furniture = inventory[instance.furnitureId];
      if (!furniture) return null;
      return {
        ...furniture,
        x: instance.x,
        y: instance.y,
      };
    })
    .filter((furniture): furniture is Furniture => furniture !== null);
};

function App() {
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

  // Use custom hooks
  useLocalStoragePersistence({ appState, floorPlans, currentFloorPlanName });

  const { pushToHistory, handleUndo, handleRedo, canUndo, canRedo } =
    useHistoryManager({
      appState,
      setAppState,
    });

  const {
    handleFloorPlanSelect,
    handleNameChange,
    handleDelete,
    handleNewFloorPlan,
    handleImageUpload,
    handleImageScaleChange,
  } = useFloorPlanManager({
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

  const {
    selectedRoom,
    selectedFurniture,
    handleRoomSelect,
    handleRoomMove,
    handleRoomResize,
    handleSwapDimensions,
    handleDeleteSelected,
    handleTabChange,
  } = useItemSelection({
    appState,
    setAppState,
    setSidebarTab,
    pushToHistory,
    handleDeleteRoom,
    handleDeleteFurniture,
  });

  const {
    handleGridSizeChange,
    handleGridOpacityChange,
    handleZoomChange,
    handleThemeChange,
    handleWallColorChange,
    handleHighlightColorChange,
  } = useAppSettings({
    appState,
    setAppState,
  });

  useKeyboardShortcuts({
    handleUndo,
    handleRedo,
    handleDeleteSelected,
  });

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Geist, sans-serif',
        },
        palette: {
          mode: appState.theme,
          primary: {
            main: '#2F4F4F',
          },
        },
      }),
    [appState.theme],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <FloorPlanTabs
          floorPlans={floorPlans}
          currentFloorPlanName={currentFloorPlanName}
          onFloorPlanSelect={handleFloorPlanSelect}
          onNewFloorPlan={handleNewFloorPlan}
        />
        <MainToolbar
          floorPlanName={appState.floorPlan.name}
          onNameChange={handleNameChange}
          onDelete={handleDelete}
          gridSize={appState.gridSize}
          onGridSizeChange={handleGridSizeChange}
          wallColor={appState.wallColor}
          onWallColorChange={handleWallColorChange}
          selectedRoomId={appState.selectedRoomId}
          highlightColor={appState.highlightColor}
          onHighlightColorChange={handleHighlightColorChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          zoom={appState.zoom}
          onZoomChange={handleZoomChange}
          onImageUpload={handleImageUpload}
          imageScale={appState.floorPlan.imageScale}
          onImageScaleChange={handleImageScaleChange}
          gridOpacity={appState.gridOpacity}
          onGridOpacityChange={handleGridOpacityChange}
          theme={appState.theme}
          onThemeChange={handleThemeChange}
        />
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <LeftPanel
            isOpen={isLeftPanelOpen}
            onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          />
          <MainContent
            rooms={appState.floorPlan.rooms}
            furniture={getFurnitureFromInstances(
              appState.floorPlan.furnitureInstances || [],
              appState.furnitureInventory,
            )}
            selectedRoomId={appState.selectedRoomId}
            onRoomSelect={handleRoomSelect}
            onRoomMove={handleRoomMove}
            onRoomResize={handleRoomResize}
            gridSize={appState.gridSize}
            zoom={appState.zoom}
            backgroundImage={appState.floorPlan.backgroundImage}
            imageScale={appState.floorPlan.imageScale}
            gridOpacity={appState.gridOpacity}
            wallColor={appState.wallColor}
            highlightColor={appState.highlightColor}
          />
          <RightSidebar
            sidebarTab={sidebarTab}
            onTabChange={handleTabChange}
            selectedRoom={selectedRoom}
            selectedFurniture={selectedFurniture}
            selectedTool={appState.selectedTool}
            onToolChange={tool =>
              setAppState(prev => ({ ...prev, selectedTool: tool }))
            }
            rooms={appState.floorPlan.rooms}
            furniture={getFurnitureFromInstances(
              appState.floorPlan.furnitureInstances || [],
              appState.furnitureInventory,
            )}
            selectedRoomId={appState.selectedRoomId}
            onRoomSelect={handleRoomSelect}
            onSwapDimensions={handleSwapDimensions}
            floorPlan={appState.floorPlan}
            appState={appState}
            setAppState={setAppState}
            setSidebarTab={setSidebarTab}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
