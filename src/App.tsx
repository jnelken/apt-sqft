import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { LayoutEditor } from './components/LayoutEditor';
import { RoomForm } from './components/RoomForm';
import { RoomDetails } from './components/RoomDetails';
import { AppState, Room } from './types';

const initialFloorPlan = {
  rooms: [],
  furniture: [],
  gridSize: 1,
};

const initialAppState: AppState = {
  floorPlan: initialFloorPlan,
  selectedRoomId: null,
  selectedTool: 'select',
  gridSize: 1,
  zoom: 1,
  theme: 'light',
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

  const handleAddRoom = (roomData: Omit<Room, 'id' | 'points' | 'x' | 'y'>) => {
    const initialX = window.innerWidth / 4;
    const initialY = window.innerHeight / 4;
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      points: [],
      x: initialX,
      y: initialY,
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

  const theme = createTheme({
    palette: {
      mode: appState.theme,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex' }}>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <LayoutEditor
            rooms={appState.floorPlan.rooms}
            selectedRoomId={appState.selectedRoomId}
            onRoomSelect={handleRoomSelect}
            onRoomMove={handleRoomMove}
            onRoomResize={handleRoomResize}
            gridSize={appState.gridSize}
            zoom={appState.zoom}
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
    </ThemeProvider>
  );
}

export default App;
