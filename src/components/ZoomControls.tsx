import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.25, 0.25));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="Zoom Out">
        <IconButton onClick={handleZoomOut} size="small">
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={`${Math.round(zoom * 100)}%`}>
        <Box sx={{ minWidth: 60, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </Box>
      </Tooltip>
      <Tooltip title="Zoom In">
        <IconButton onClick={handleZoomIn} size="small">
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
