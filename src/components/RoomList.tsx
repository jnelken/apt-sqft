import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Room } from '../types';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rooms
      </Typography>
      <Paper>
        <List>
          {rooms.map((room, index) => (
            <React.Fragment key={room.id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={room.id === selectedRoomId}
                  onClick={() => onRoomSelect(room.id)}>
                  <ListItemText
                    primary={room.name}
                    secondary={`${room.sqFootage} sq ft`}
                  />
                </ListItemButton>
              </ListItem>
              {index < rooms.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {rooms.length === 0 && (
            <ListItem>
              <ListItemText primary="No rooms added yet" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};
