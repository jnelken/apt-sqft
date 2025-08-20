import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Room } from '../types';

interface RoomDetailsProps {
  room: Room | null;
  onEdit?: () => void;
  onSwapDimensions?: () => void;
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({
  room,
  onEdit,
  onSwapDimensions,
}) => {
  if (!room) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No room selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Typography variant="h6">Room Details</Typography>
        {onEdit && (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
            Edit Room
          </Button>
        )}
      </Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          <strong>Name:</strong> {room.name}
        </Typography>
        <Typography variant="body1">
          <strong>Width:</strong> {room.width} inches
        </Typography>
        {onSwapDimensions && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Tooltip title="Swap height and width dimensions">
              <IconButton onClick={onSwapDimensions} size="small">
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
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
          <strong>Room Type:</strong>{' '}
          {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
        </Typography>
      </Paper>
    </Box>
  );
};
