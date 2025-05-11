import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface GridSettingsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridSize,
  onGridSizeChange,
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
    { value: 12 },
    { value: 24 },
    { value: 36 },
    { value: 48 },
    { value: 60 },
    { value: 72 },
    { value: 84 },
    { value: 96 },
    { value: 108 },
    { value: 120 },
    { value: 132 },
    { value: 144 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Grid Settings
      </Typography>
      <Typography id="grid-size-slider" gutterBottom>
        Grid Size: {gridSize}in
      </Typography>
      <Slider
        value={gridSize}
        onChange={handleChange}
        aria-labelledby="grid-size-slider"
        valueLabelDisplay="auto"
        step={1}
        marks={marks}
        min={1}
        max={144}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Adjust the grid size to change the spacing between grid lines. The grid
        size is in pixels. You can use fine-grained control (1px) or snap to
        common measurements (6px, 12px).
      </Typography>
    </Box>
  );
};
