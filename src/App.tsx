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
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import { AppState, Room, FloorPlan } from './types';
import { ColorSettings } from './components/ColorSettings';
import { FloorPlanTabs } from './components/FloorPlanTabs';
import { Typography } from '@mui/material';

const INIT_GRID_SIZE = 12;

const initialFloorPlan = {
  name: 'Untitled',
  rooms: [],
  furniture: [],
  backgroundImage: null,
  imageScale: 1,
};

const initialAppState: AppState = {
  floorPlan: initialFloorPlan,
  selectedRoomId: null,
  selectedTool: 'select',
  zoom: 1,
  theme: 'light',
  highlightColor: '#377c7c',
  wallColor: '#377c7c',
  gridSize: INIT_GRID_SIZE,
  gridOpacity: 0.2,
};

function App() {
  const [floorPlans, setFloorPlans] = useState<{ [key: string]: FloorPlan }>(
    () => {
      const savedFloorPlans = localStorage.getItem('floorPlans');
      return savedFloorPlans
        ? JSON.parse(savedFloorPlans)
        : { Untitled: initialFloorPlan };
    },
  );

  const [currentFloorPlanName, setCurrentFloorPlanName] = useState<string>(
    () => {
      const savedCurrentName = localStorage.getItem('currentFloorPlanName');
      return savedCurrentName || 'Untitled';
    },
  );

  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('appState');
    return savedState ? JSON.parse(savedState) : initialAppState;
  });

  const [sidebarTab, setSidebarTab] = useState(0);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Save floor plans and current name to localStorage
  useEffect(() => {
    localStorage.setItem('floorPlans', JSON.stringify(floorPlans));
    localStorage.setItem('currentFloorPlanName', currentFloorPlanName);
  }, [floorPlans, currentFloorPlanName]);

  // Save app state to localStorage
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(appState));
  }, [appState]);

  const handleFloorPlanSelect = (name: string) => {
    // Save current floor plan state
    setFloorPlans(prev => ({
      ...prev,
      [currentFloorPlanName]: appState.floorPlan,
    }));

    // Load selected floor plan
    setCurrentFloorPlanName(name);
    setAppState(prev => ({
      ...prev,
      floorPlan: floorPlans[name],
    }));
  };

  const handleNameChange = (name: string) => {
    // If the name is changing, we need to update the floor plans object
    if (name !== currentFloorPlanName) {
      const newFloorPlans = { ...floorPlans };
      // Remove the old name entry
      delete newFloorPlans[currentFloorPlanName];
      // Add the new name entry
      newFloorPlans[name] = { ...appState.floorPlan, name };
      setFloorPlans(newFloorPlans);
      setCurrentFloorPlanName(name);
    }

    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, name },
    }));
  };

  const handleDelete = () => {
    // Remove the current floor plan
    const newFloorPlans = { ...floorPlans };
    delete newFloorPlans[currentFloorPlanName];
    setFloorPlans(newFloorPlans);

    // Switch to the first available floor plan or create a new one
    const remainingNames = Object.keys(newFloorPlans);
    if (remainingNames.length > 0) {
      setCurrentFloorPlanName(remainingNames[0]);
      setAppState(prev => ({
        ...prev,
        floorPlan: newFloorPlans[remainingNames[0]],
      }));
    } else {
      setCurrentFloorPlanName('Untitled');
      setAppState(prev => ({
        ...prev,
        floorPlan: initialFloorPlan,
      }));
    }
  };

  const handleNewFloorPlan = () => {
    // Generate a unique name for the new floor plan
    const baseName = 'Untitled';
    let newName = baseName;
    let counter = 1;
    while (floorPlans[newName]) {
      newName = `${baseName} ${counter}`;
      counter++;
    }

    // Save current floor plan state
    setFloorPlans(prev => ({
      ...prev,
      [currentFloorPlanName]: appState.floorPlan,
    }));

    // Create new floor plan
    const newFloorPlan = {
      ...initialFloorPlan,
      name: newName,
    };

    setFloorPlans(prev => ({
      ...prev,
      [newName]: newFloorPlan,
    }));

    // Switch to the new floor plan
    setCurrentFloorPlanName(newName);
    setAppState(prev => ({
      ...prev,
      floorPlan: newFloorPlan,
    }));
  };

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
      gridSize: newSize,
    }));
  };

  const handleGridOpacityChange = (opacity: number) => {
    setAppState(prev => ({
      ...prev,
      gridOpacity: opacity,
    }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const newName =
        appState.floorPlan.name === 'Untitled'
          ? file.name.replace(/\.[^/.]+$/, '') // Remove file extension
          : appState.floorPlan.name;

      // Update floor plans object with new name
      const newFloorPlans = { ...floorPlans };
      delete newFloorPlans[appState.floorPlan.name];
      newFloorPlans[newName] = {
        ...appState.floorPlan,
        name: newName,
        backgroundImage: e.target?.result as string,
      };
      setFloorPlans(newFloorPlans);
      setCurrentFloorPlanName(newName);

      // Update app state
      setAppState(prev => ({
        ...prev,
        floorPlan: {
          ...prev.floorPlan,
          name: newName,
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
            ? {
                ...room,
                width,
                height,
                sqFootage: (width * height) / 144, // Convert square inches to square feet
              }
            : room,
        ),
      },
    }));
  };

  const handleAddRoom = (roomData: Omit<Room, 'id' | 'points'>) => {
    // Get the editor container dimensions
    const editorContainer = document.querySelector(
      '.LayoutEditor',
    ) as HTMLElement;
    const editorWidth = editorContainer?.offsetWidth;
    const editorHeight = editorContainer?.offsetHeight;

    // Calculate center position by adding half the editor dimensions
    const centeredX = editorWidth / 2 - roomData.width / 2;
    const centeredY = editorHeight / 2 - roomData.height / 2;

    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      points: [],
      x: centeredX,
      y: centeredY,
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

  const handleDeleteRoom = () => {
    if (!appState.selectedRoomId) return;

    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: prev.floorPlan.rooms.filter(
          room => room.id !== appState.selectedRoomId,
        ),
      },
      selectedRoomId: null,
    }));
    setSidebarTab(0); // Switch to Add Room tab after deletion
  };

  const handleDuplicateRoom = () => {
    if (!appState.selectedRoomId) return;
    const roomToClone = appState.floorPlan.rooms.find(
      room => room.id === appState.selectedRoomId,
    );
    if (!roomToClone) return;

    const newRoom: Room = {
      ...roomToClone,
      id: Date.now().toString(),
      name: `${roomToClone.name} (Copy)`,
      x: roomToClone.x + 50,
      y: roomToClone.y + 50,
      points: [],
    };

    setAppState(prev => ({
      ...prev,
      floorPlan: {
        ...prev.floorPlan,
        rooms: [...prev.floorPlan.rooms, newRoom],
      },
      selectedRoomId: newRoom.id,
    }));
  };

  const handleZoomChange = (newZoom: number) => {
    setAppState(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setAppState(prev => ({ ...prev, theme: newTheme }));
  };

  const handleWallColorChange = (color: string) => {
    setAppState(prev => ({
      ...prev,
      wallColor: color,
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
        <FloorPlanTabs
          floorPlans={floorPlans}
          currentFloorPlanName={currentFloorPlanName}
          onFloorPlanSelect={handleFloorPlanSelect}
          onNewFloorPlan={handleNewFloorPlan}
        />
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <FloorPlanName
              name={appState.floorPlan.name}
              onNameChange={handleNameChange}
              onDelete={handleDelete}
            />
            <Box sx={{ width: 16 }} />
            <GridSettings
              gridSize={appState.gridSize}
              onGridSizeChange={handleGridSizeChange}
              gridOpacity={appState.gridOpacity}
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
          <Box
            sx={{
              width: isLeftPanelOpen ? 300 : 0,
              borderRight: 1,
              borderColor: 'divider',
              transition: 'width 0.2s',
              overflow: 'hidden',
              position: 'relative',
            }}>
            <ColorSettings
              wallColor={appState.wallColor}
              onWallColorChange={handleWallColorChange}
              selectedRoomId={appState.selectedRoomId}
              highlightColor={appState.highlightColor}
              onHighlightColorChange={handleHighlightColorChange}
            />
            <IconButton
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              sx={{
                'position': 'absolute',
                'right': -20,
                'top': '50%',
                'transform': 'translateY(-50%)',
                'backgroundColor': 'background.paper',
                'border': 1,
                'borderColor': 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}>
              {isLeftPanelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <LayoutEditor
              rooms={appState.floorPlan.rooms}
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
                  appState.selectedTool === 'edit' ? (
                    <Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                          onClick={() =>
                            setAppState(prev => ({
                              ...prev,
                              selectedTool: 'select',
                            }))
                          }
                          sx={{ mr: 1 }}>
                          <ChevronLeftIcon />
                        </IconButton>
                        <Typography variant="h6">Edit Room</Typography>
                      </Box>
                      <RoomForm
                        onSubmit={handleUpdateRoom}
                        initialValues={selectedRoom}
                        onDelete={handleDeleteRoom}
                        onDuplicate={handleDuplicateRoom}
                      />
                    </Box>
                  ) : (
                    <RoomDetails
                      room={selectedRoom}
                      onEdit={() => {
                        setAppState(prev => ({
                          ...prev,
                          selectedTool: 'edit',
                        }));
                      }}
                    />
                  )
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
