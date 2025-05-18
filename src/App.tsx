import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ListIcon from '@mui/icons-material/List';
import { LayoutEditor } from './components/LayoutEditor';
import { RoomForm } from './components/RoomForm';
import { RoomDetails } from './components/RoomDetails';
import { RoomList } from './components/RoomList';
import { GridSettings } from './components/GridSettings';
import { ImageSettings } from './components/ImageSettings';
import { ZoomControls } from './components/ZoomControls';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { FloorPlanName } from './components/FloorPlanName';
import { FloorPlanDetails } from './components/FloorPlanDetails';
import { AppState, Room } from './types';
import { ColorSettings } from './components/ColorSettings';

const INIT_GRID_SIZE = 12;

const initialFloorPlan = {
  name: 'Untitled Floor Plan',
  rooms: [],
  furniture: [],
  backgroundImage: null,
  imageScale: 1,
  gridSize: INIT_GRID_SIZE,
  gridOpacity: 0.2,
  wallColor: '#000000',
};

const initialAppState: AppState = {
  floorPlan: initialFloorPlan,
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#e3f2fd',
};

function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('currentFloorPlan');
    return savedState ? JSON.parse(savedState) : initialAppState;
  });
  const [sidebarTab, setSidebarTab] = useState(0);

  useEffect(() => {
    localStorage.setItem('currentFloorPlan', JSON.stringify(appState));
  }, [appState]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSidebarTab(newValue);
    // Clear room selection when switching to Add Room tab
    if (newValue === 0) {
      setAppState(prev => ({ ...prev, selectedRoomId: null }));
    }
  };

  const handleGridSizeChange = (newSize: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, gridSize: newSize },
    }));
  };

  const handleGridOpacityChange = (opacity: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, gridOpacity: opacity },
    }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setAppState(prev => ({
        ...prev,
        floorPlan: {
          ...prev.floorPlan,
          backgroundImage: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageScaleChange = (scale: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, imageScale: scale },
    }));
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
                sqFootage: (roomData.width * roomData.height) / 144,
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

  const handleNameChange = (name: string) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, name },
    }));
  };

  const handleDelete = () => {
    localStorage.removeItem('currentFloorPlan');
    setAppState(initialAppState);
  };

  const handleWallColorChange = (color: string) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, wallColor: color },
    }));
  };

  const handleHighlightColorChange = (color: string) => {
    setAppState(prev => ({ ...prev, highlightColor: color }));
  };

  const theme = createTheme({
    typography: {
      fontFamily: 'Geist, sans-serif',
      // fontFeatureSettings: '"rlig", "calt"',
    },
    palette: {
      mode: appState.theme,
      primary: {
        main: '#2F4F4F', // Slate green color
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <FloorPlanName
              name={appState.floorPlan.name}
              onNameChange={handleNameChange}
              onDelete={handleDelete}
            />
            <Box sx={{ width: 16 }} />
            <GridSettings
              gridSize={appState.floorPlan.gridSize}
              onGridSizeChange={handleGridSizeChange}
              gridOpacity={appState.floorPlan.gridOpacity}
              onGridOpacityChange={handleGridOpacityChange}
            />
            <Box sx={{ flexGrow: 1 }} />
            <ZoomControls
              zoom={appState.zoom}
              onZoomChange={handleZoomChange}
            />
            <Box sx={{ width: 16 }} />
            <ImageSettings
              onImageUpload={handleImageUpload}
              imageScale={appState.floorPlan.imageScale}
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
          <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
            <ColorSettings
              wallColor={appState.floorPlan.wallColor}
              onWallColorChange={handleWallColorChange}
              selectedRoomId={appState.selectedRoomId}
              highlightColor={appState.highlightColor}
              onHighlightColorChange={handleHighlightColorChange}
            />
          </Box>
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <LayoutEditor
              rooms={appState.floorPlan.rooms}
              selectedRoomId={appState.selectedRoomId}
              onRoomSelect={handleRoomSelect}
              onRoomMove={handleRoomMove}
              onRoomResize={handleRoomResize}
              gridSize={appState.floorPlan.gridSize}
              zoom={appState.zoom}
              backgroundImage={appState.floorPlan.backgroundImage}
              imageScale={appState.floorPlan.imageScale}
              gridOpacity={appState.floorPlan.gridOpacity}
              wallColor={appState.floorPlan.wallColor}
              highlightColor={appState.highlightColor}
            />
          </Box>
          <Box sx={{ width: 400, borderLeft: 1, borderColor: 'divider' }}>
            <Tabs value={sidebarTab} onChange={handleTabChange}>
              <Tooltip title="Add Room">
                <Tab icon={<AddIcon />} aria-label="Add Room" />
              </Tooltip>
              <Tooltip title="Room Details">
                <Tab icon={<EditIcon />} aria-label="Room Details" />
              </Tooltip>
              <Tooltip title="Floor Plan Details">
                <Tab icon={<InfoIcon />} aria-label="Floor Plan Details" />
              </Tooltip>
              <Tooltip title="Room List">
                <Tab icon={<ListIcon />} aria-label="Room List" />
              </Tooltip>
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
            {sidebarTab === 2 && (
              <FloorPlanDetails floorPlan={appState.floorPlan} />
            )}
            {sidebarTab === 3 && (
              <RoomList
                rooms={appState.floorPlan.rooms}
                selectedRoomId={appState.selectedRoomId}
                onRoomSelect={handleRoomSelect}
              />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
