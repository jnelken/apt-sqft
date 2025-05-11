import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Room } from '../types';

interface RoomDetailsProps {
  room: Room | null;
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({ room }) => {
  if (!room) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No room selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Room Details
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          <strong>Name:</strong> {room.name}
        </Typography>
        <Typography variant="body1">
          <strong>Width:</strong> {room.width} inches
        </Typography>
        <Typography variant="body1">
          <strong>Height:</strong> {room.height} inches
        </Typography>
        <Typography variant="body1">
          <strong>Square Footage:</strong> {room.sqFootage} sq ft
        </Typography>
        <Typography variant="body1">
          <strong>Position:</strong> ({room.x}, {room.y})
        </Typography>
        <Typography variant="body1">
          <strong>Livable Space:</strong> {room.isLivable ? 'Yes' : 'No'}
        </Typography>
      </Paper>
    </Box>
  );
};
