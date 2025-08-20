import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Slider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface SettingsProps {
  gridOpacity: number;
  onGridOpacityChange: (opacity: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  gridOpacity,
  onGridOpacityChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Settings">
        <IconButton onClick={handleClick} size="small">
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Settings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Tooltip title="Adjust the grid opacity">
              <Typography id="grid-opacity-slider" sx={{ minWidth: 80 }}>
                Grid Opacity: {Math.round(gridOpacity * 100)}%
              </Typography>
            </Tooltip>
            <Slider
              value={gridOpacity}
              onChange={(_event, value) => onGridOpacityChange(value as number)}
              aria-labelledby="grid-opacity-slider"
              valueLabelDisplay="auto"
              step={0.1}
              min={0}
              max={1}
              sx={{ width: 120 }}
            />
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
