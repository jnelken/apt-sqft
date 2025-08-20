import React from 'react';
import { Tabs, Tab, Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FloorPlan } from '../types';

interface FloorPlanTabsProps {
  floorPlans: { [key: string]: FloorPlan };
  currentFloorPlanName: string;
  onFloorPlanSelect: (name: string) => void;
  onNewFloorPlan: () => void;
}

export const FloorPlanTabs: React.FC<FloorPlanTabsProps> = ({
  floorPlans,
  currentFloorPlanName,
  onFloorPlanSelect,
  onNewFloorPlan,
}) => {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
      }}>
      <Tooltip title="New Floor Plan">
        <IconButton onClick={onNewFloorPlan} size="small" sx={{ mr: 1 }}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Tabs
        value={currentFloorPlanName}
        onChange={(_e, newValue) => onFloorPlanSelect(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ flexGrow: 1 }}>
        {Object.keys(floorPlans).map(name => (
          <Tab
            key={name}
            label={name}
            value={name}
            sx={{ textTransform: 'none' }}
          />
        ))}
      </Tabs>
    </Box>
  );
};
