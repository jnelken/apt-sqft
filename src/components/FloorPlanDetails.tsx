import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { FloorPlan } from '../types';

interface FloorPlanDetailsProps {
  floorPlan: FloorPlan;
}

export const FloorPlanDetails: React.FC<FloorPlanDetailsProps> = ({
  floorPlan,
}) => {
  const totalLivableSqFt = floorPlan.rooms
    .filter(room => room.isLivable)
    .reduce((sum, room) => sum + room.sqFootage, 0);

  const totalNonLivableSqFt = floorPlan.rooms
    .filter(room => !room.isLivable)
    .reduce((sum, room) => sum + room.sqFootage, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Floor Plan Details
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body1">
            <strong>Total Livable Space:</strong>
          </Typography>
          <Typography variant="body1">{totalLivableSqFt} sq ft</Typography>

          <Typography variant="body1">
            <strong>Total Non-Livable Space:</strong>
          </Typography>
          <Typography variant="body1">{totalNonLivableSqFt} sq ft</Typography>

          <Typography variant="body1">
            <strong>Total Space:</strong>
          </Typography>
          <Typography variant="body1">
            {totalLivableSqFt + totalNonLivableSqFt} sq ft
          </Typography>
          <Typography variant="body1">
            <strong>Number of Rooms:</strong>
          </Typography>
          <Typography variant="body1">{floorPlan.rooms.length}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};
