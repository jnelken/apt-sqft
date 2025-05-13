import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { LayoutEditor } from './components/LayoutEditor';
import { RoomForm } from './components/RoomForm';
import { RoomDetails } from './components/RoomDetails';
import { GridSettings } from './components/GridSettings';
import { ImageSettings } from './components/ImageSettings';
import { ZoomControls } from './components/ZoomControls';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { AppState, Room } from './types';

const INIT_GRID_SIZE = 12;

const initialFloorPlan = {
  rooms: [],
  furniture: [],
};

const initialAppState: AppState = {
  floorPlan: initialFloorPlan,
  selectedRoomId: null,
  selectedTool: 'select',
  gridSize: INIT_GRID_SIZE,
  zoom: 1,
  theme: 'light',
  backgroundImage: null,
  imageScale: 1,
};

function App() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [sidebarTab, setSidebarTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSidebarTab(newValue);
    // Clear room selection when switching to Add Room tab
    if (newValue === 0) {
      setAppState(prev => ({ ...prev, selectedRoomId: null }));
    }
  };

  const handleGridSizeChange = (newSize: number) => {
    setAppState(prev => ({ ...prev, gridSize: newSize }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setAppState(prev => ({
        ...prev,
        backgroundImage: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageScaleChange = (scale: number) => {
    setAppState(prev => ({ ...prev, imageScale: scale }));
  };

  const selectedRoom = appState.floorPlan.rooms.find(
    room => room.id === appState.selectedRoomId,
  );

  const handleRoomSelect = (roomId: string | null) => {
    setAppState(prev => ({ ...prev, selectedRoomId: roomId }));
    if (roomId) {
      setSidebarTab(1); // Switch to Room Details tab when a room is selected
    }
  };

  const handleRoomMove = (roomId: string, x: number, y: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: prev.floorPlan.rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                x,
                y,
              }
            : room,
        ),
      },
    }));
  };

  const handleRoomResize = (roomId: string, width: number, height: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: prev.floorPlan.rooms.map(room =>
          room.id === roomId
            ? { ...room, width, height, sqFootage: width * height }
            : room,
        ),
      },
    }));
  };

  const handleAddRoom = (roomData: Omit<Room, 'id' | 'points'>) => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      points: [],
    };

    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: [...prev.floorPlan.rooms, newRoom],
      },
    }));
  };

  const handleUpdateRoom = (roomData: Omit<Room, 'id' | 'points'>) => {
    if (!appState.selectedRoomId) return;

    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: prev.floorPlan.rooms.map(room =>
          room.id === appState.selectedRoomId
            ? {
                ...room,
                ...roomData,
                sqFootage: roomData.width * roomData.height,
              }
            : room,
        ),
      },
    }));
  };

  const handleZoomChange = (newZoom: number) => {
    setAppState(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setAppState(prev => ({ ...prev, theme: newTheme }));
  };

  const theme = createTheme({
    typography: {
      fontFamily: 'Geist, sans-serif',
      // fontFeatureSettings: '"rlig", "calt"',
    },
    palette: {
      mode: appState.theme,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <GridSettings
              gridSize={appState.gridSize}
              onGridSizeChange={handleGridSizeChange}
            />
            <Box sx={{ flexGrow: 1 }} />
            <ZoomControls
              zoom={appState.zoom}
              onZoomChange={handleZoomChange}
            />
            <Box sx={{ width: 16 }} />
            <ImageSettings
              onImageUpload={handleImageUpload}
              imageScale={appState.imageScale}
              onImageScaleChange={handleImageScaleChange}
            />
            <Box sx={{ width: 16 }} />
            <ThemeSwitcher
              theme={appState.theme}
              onThemeChange={handleThemeChange}
            />
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <LayoutEditor
              rooms={appState.floorPlan.rooms}
              selectedRoomId={appState.selectedRoomId}
              onRoomSelect={handleRoomSelect}
              onRoomMove={handleRoomMove}
              onRoomResize={handleRoomResize}
              gridSize={appState.gridSize}
              zoom={appState.zoom}
              backgroundImage={appState.backgroundImage}
              imageScale={appState.imageScale}
            />
          </Box>
          <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider' }}>
            <Tabs value={sidebarTab} onChange={handleTabChange}>
              <Tab label="Add Room" />
              <Tab label="Room Details" />
            </Tabs>
            {sidebarTab === 0 && <RoomForm onSubmit={handleAddRoom} />}
            {sidebarTab === 1 && (
              <>
                {selectedRoom ? (
                  <RoomForm
                    onSubmit={handleUpdateRoom}
                    initialValues={selectedRoom}
                  />
                ) : (
                  <RoomDetails room={null} />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
