'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { FloorPlanTabs } from '@/components/FloorPlanTabs';
import { MainToolbar } from '@/components/MainToolbar';
import { HotkeysToolbar } from '@/components/HotkeysToolbar';
import { LeftPanel } from '@/components/LeftPanel';
import { MainContent } from '@/components/MainContent';
import { RightSidebar } from '@/components/RightSidebar';
import { RoomList } from '@/components/RoomList';
import { FurnitureList } from '@/components/FurnitureList';
import Divider from '@mui/material/Divider';
import { useAppController } from '@/lib/hooks/useAppController';
import { useAppTheme } from '@/lib/hooks/useAppTheme';
import { getFurnitureFromInstances } from '@/lib/utils/getFurnitureFromInstances';

function App() {
  const app = useAppController();
  const { appState } = app;
  const theme = useAppTheme(appState.theme);
  const furniture = getFurnitureFromInstances(
    appState.floorPlan.furnitureInstances || [],
    appState.furnitureInventory,
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
        className={process.env.NODE_ENV === 'development' ? 'DEBUG_MODE' : ''}
      >
        <FloorPlanTabs
          floorPlans={app.floorPlans}
          currentFloorPlanName={app.currentFloorPlanName}
          onFloorPlanSelect={app.handleFloorPlanSelect}
          onNewFloorPlan={app.handleNewFloorPlan}
        />
        <MainToolbar
          floorPlanName={appState.floorPlan.name}
          onNameChange={app.handleNameChange}
          onDelete={app.handleDelete}
          gridSize={appState.gridSize}
          onGridSizeChange={app.handleGridSizeChange}
          wallColor={appState.wallColor}
          onWallColorChange={app.handleWallColorChange}
          selectedRoomId={appState.selectedRoomId}
          highlightColor={appState.highlightColor}
          onHighlightColorChange={app.handleHighlightColorChange}
          onUndo={app.handleUndo}
          onRedo={app.handleRedo}
          canUndo={app.canUndo}
          canRedo={app.canRedo}
          zoom={appState.zoom}
          onZoomChange={app.handleZoomChange}
          onImageUpload={app.handleImageUpload}
          imageScale={appState.floorPlan.imageScale}
          onImageScaleChange={app.handleImageScaleChange}
          gridOpacity={appState.gridOpacity}
          onGridOpacityChange={app.handleGridOpacityChange}
          theme={appState.theme}
          onThemeChange={app.handleThemeChange}
        />
        <HotkeysToolbar
          editorMode={app.editorMode}
          onEditorModeChange={app.setEditorMode}
        />
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <LeftPanel
            isOpen={app.isLeftPanelOpen}
            onToggle={app.toggleLeftPanel}
          >
            <RoomList
              rooms={appState.floorPlan.rooms}
              selectedRoomId={appState.selectedRoomId}
              onRoomSelect={app.handleRoomSelect}
            />
            <Divider />
            <FurnitureList
              furniture={furniture}
              selectedRoomId={appState.selectedRoomId}
              onRoomSelect={app.handleRoomSelect}
            />
          </LeftPanel>
          <MainContent
            rooms={appState.floorPlan.rooms}
            furniture={furniture}
            selectedRoomId={appState.selectedRoomId}
            onRoomSelect={app.handleRoomSelect}
            onRoomMove={app.handleRoomMove}
            onRoomResize={app.handleRoomResize}
            onRoomScale={app.handleRoomScale}
            editorMode={app.editorMode}
            gridSize={appState.gridSize}
            zoom={appState.zoom}
            backgroundImage={appState.floorPlan.backgroundImage}
            imageScale={appState.floorPlan.imageScale}
            gridOpacity={appState.gridOpacity}
            wallColor={appState.wallColor}
            highlightColor={appState.highlightColor}
          />
          <RightSidebar
            sidebarTab={app.sidebarTab}
            onTabChange={app.handleTabChange}
            selectedRoom={app.selectedRoom}
            selectedFurniture={app.selectedFurniture}
            selectedTool={appState.selectedTool}
            onToolChange={app.handleToolChange}
            rooms={appState.floorPlan.rooms}
            furniture={furniture}
            selectedRoomId={appState.selectedRoomId}
            onRoomSelect={app.handleRoomSelect}
            onSwapDimensions={app.handleSwapDimensions}
            floorPlan={appState.floorPlan}
            appState={appState}
            setAppState={app.setAppState}
            setSidebarTab={app.setSidebarTab}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
