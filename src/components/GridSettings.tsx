import React from 'react';
import { Box, Typography, Slider, Tooltip } from '@mui/material';

interface GridSettingsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  gridOpacity: number;
  onGridOpacityChange: (opacity: number) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridSize,
  onGridSizeChange,
  gridOpacity,
  onGridOpacityChange,
}) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    if (value < 6) {
      onGridSizeChange(1);
    } else if (value < 12) {
      onGridSizeChange(6);
    } else {
      onGridSizeChange(Math.round(value / 12) * 12);
    }
  };

  // Define marks for the slider
  const marks = [
    { value: 1 },
    { value: 6 },
    { value: 12 }, // 1ft
    { value: 24 }, // 2ft
    { value: 36 }, // 3ft
    { value: 48 }, // 4ft
    { value: 60 }, // 5ft
    { value: 72 }, // 6ft
    { value: 84 }, // 7ft
    { value: 96 }, // 8ft
    { value: 108 }, // 9ft
    { value: 120 }, // 10ft
    { value: 132 }, // 11ft
    { value: 144 }, // 12ft
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Adjust the grid size to change the spacing between grid lines">
          <Typography id="grid-size-slider" sx={{ minWidth: 100 }}>
            Grid: {gridSize > 12 ? `${gridSize / 12}ft` : `${gridSize}in`}
          </Typography>
        </Tooltip>
        <Slider
          value={gridSize}
          onChange={(_event, value) => onGridSizeChange(value as number)}
          aria-labelledby="grid-size-slider"
          valueLabelDisplay="auto"
          step={1}
          min={1}
          max={144}
          sx={{ width: 120 }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Adjust the grid opacity">
          <Typography id="grid-opacity-slider" sx={{ minWidth: 100 }}>
            Opacity: {Math.round(gridOpacity * 100)}%
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
  );
};
