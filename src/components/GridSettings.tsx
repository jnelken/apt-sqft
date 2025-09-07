import React from 'react';
import { Box, Typography, Slider, Tooltip } from '@mui/material';

interface GridSettingsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridSize,
  onGridSizeChange,
}) => {
  const handleChange = (newValue: number | number[]) => {
    const value = newValue as number;
    // Snap strictly to 1in, 6in, or 12in
    if (value <= 3) return onGridSizeChange(1);
    if (value < 9) return onGridSizeChange(6);
    return onGridSizeChange(12);
  };

  // Define marks for the slider
  const marks = [
    { value: 1, label: '1in' },
    { value: 6, label: '6in' },
    { value: 12, label: '12in' },
  ];

  const gridSizeLabel = `${gridSize}in`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Adjust the grid size to change the spacing between grid lines">
          <Typography
            id="grid-size-slider"
            sx={{ width: 100, overflow: 'hidden' }}
          >
            Grid:{' '}
            {gridSize > 12 ? `${Math.round(gridSize / 12)}ft` : `${gridSize}in`}
          </Typography>
        </Tooltip>
        <Slider
          value={gridSize}
          onChange={(_event, value) => handleChange(value as number)}
          aria-labelledby="grid-size-slider"
          valueLabelDisplay="auto"
          step={1}
          min={1}
          marks={marks}
          max={12}
          sx={{ width: 120 }}
        />
      </Box>
    </Box>
  );
};
