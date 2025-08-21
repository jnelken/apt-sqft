'use client';

import React, { useState } from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface ColorSettingsProps {
  wallColor: string;
  onWallColorChange: (color: string) => void;
  selectedRoomId: string | null;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
}

export const ColorSettings: React.FC<ColorSettingsProps> = ({
  wallColor,
  onWallColorChange,
  selectedRoomId,
  highlightColor,
  onHighlightColorChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: string) => {
    onWallColorChange(color);
    onHighlightColorChange(color);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          'width': 32,
          'height': 32,
          'backgroundColor': wallColor,
          'border': '1px solid',
          'borderColor': 'divider',
          '&:hover': {
            backgroundColor: wallColor,
            opacity: 0.8,
          },
        }}>
        <ColorLensIcon sx={{ color: 'white', opacity: 0.5 }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}>
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={wallColor} onChange={handleColorChange} />
        </Box>
      </Popover>
    </>
  );
};
