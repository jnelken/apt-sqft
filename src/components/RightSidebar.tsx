import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ListIcon from '@mui/icons-material/List';
import ChairIcon from '@mui/icons-material/Chair';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { RoomForm } from './RoomForm';
import { RoomDetails } from './RoomDetails';
import { RoomList } from './RoomList';
import { FloorPlanDetails } from './FloorPlanDetails';
import { FurnitureForm } from './FurnitureForm';
import { FurnitureList } from './FurnitureList';
import { Room, Furniture, AppState } from '@/lib/types';
import { useRoomManager } from '@/lib/hooks/useRoomManager';
import { useFurnitureManager } from '@/lib/hooks/useFurnitureManager';
import { useHistoryManager } from '@/lib/hooks/useHistoryManager';

interface RightSidebarProps {
  sidebarTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  selectedRoom: Room | undefined;
  selectedFurniture: Furniture | undefined;
  selectedTool: 'select' | 'move' | 'resize' | 'add-point' | 'edit';
  onToolChange: (
    tool: 'select' | 'move' | 'resize' | 'add-point' | 'edit',
  ) => void;
  rooms: Room[];
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onSwapDimensions: () => void;
  floorPlan: any; // TODO: Add proper type
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setSidebarTab: React.Dispatch<React.SetStateAction<number>>;
}

export function RightSidebar({
  sidebarTab,
  onTabChange,
  selectedRoom,
  selectedFurniture,
  selectedTool,
  onToolChange,
  rooms,
  furniture,
  selectedRoomId,
  onRoomSelect,
  onSwapDimensions,
  floorPlan,
  appState,
  setAppState,
  setSidebarTab,
}: RightSidebarProps) {
  const { pushToHistory } = useHistoryManager({ appState, setAppState });

  const {
    handleAddRoom,
    handleUpdateRoom,
    handleDuplicateRoom,
    handleDeleteRoom,
  } = useRoomManager({
    appState,
    setAppState,
    pushToHistory,
    setSidebarTab,
  });

  const {
    handleAddFurniture,
    handleUpdateFurniture,
    handleDuplicateFurniture,
    handleDeleteFurniture,
  } = useFurnitureManager({
    appState,
    setAppState,
    pushToHistory,
    setSidebarTab,
  });

  return (
    <Box
      sx={{
        width: 400,
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Tabs
        value={sidebarTab}
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          'minHeight': 48,
          '& .MuiTabs-flexContainer': {
            justifyContent: 'space-around',
          },
          '& .MuiTab-root': {
            minWidth: 'auto',
            flex: 1,
          },
        }}>
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
        <Tooltip title="Add Furniture">
          <Tab icon={<ChairIcon />} aria-label="Add Furniture" />
        </Tooltip>
      </Tabs>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {sidebarTab === 0 && <RoomForm onSubmit={handleAddRoom} />}
        {sidebarTab === 1 && (
          <>
            {selectedRoom ? (
              selectedTool === 'edit' ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton
                      onClick={() => onToolChange('select')}
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
                  onEdit={() => onToolChange('edit')}
                  onSwapDimensions={onSwapDimensions}
                />
              )
            ) : selectedFurniture ? (
              selectedTool === 'edit' ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton
                      onClick={() => onToolChange('select')}
                      sx={{ mr: 1 }}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6">Edit Furniture</Typography>
                  </Box>
                  <FurnitureForm
                    onSubmit={handleUpdateFurniture}
                    initialValues={selectedFurniture}
                    onDelete={handleDeleteFurniture}
                    onDuplicate={handleDuplicateFurniture}
                  />
                </Box>
              ) : (
                <RoomDetails
                  room={selectedFurniture}
                  onEdit={() => onToolChange('edit')}
                  onSwapDimensions={onSwapDimensions}
                />
              )
            ) : (
              <RoomDetails room={null} />
            )}
          </>
        )}
        {sidebarTab === 2 && <FloorPlanDetails floorPlan={floorPlan} />}
        {sidebarTab === 3 && (
          <>
            <RoomList
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onRoomSelect={onRoomSelect}
            />
            <Divider />
            <FurnitureList
              furniture={furniture}
              selectedRoomId={selectedRoomId}
              onRoomSelect={onRoomSelect}
            />
          </>
        )}
        {sidebarTab === 4 && (
          <>
            {selectedRoom ? (
              selectedTool === 'edit' ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton
                      onClick={() => onToolChange('select')}
                      sx={{ mr: 1 }}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6">Edit Furniture</Typography>
                  </Box>
                  <FurnitureForm
                    onSubmit={handleUpdateFurniture}
                    initialValues={selectedRoom}
                    onDelete={handleDeleteFurniture}
                    onDuplicate={handleDuplicateFurniture}
                  />
                </Box>
              ) : (
                <RoomDetails
                  room={selectedRoom}
                  onEdit={() => onToolChange('edit')}
                  onSwapDimensions={onSwapDimensions}
                />
              )
            ) : (
              <FurnitureForm onSubmit={handleAddFurniture} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
