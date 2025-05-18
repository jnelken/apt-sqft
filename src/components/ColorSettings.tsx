import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

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
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2">Wall Color</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="color"
          value={wallColor}
          onChange={e => onWallColorChange(e.target.value)}
          style={{ width: 40, height: 40, padding: 0, border: 'none' }}
        />
        <TextField
          size="small"
          value={wallColor}
          onChange={e => onWallColorChange(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      <Typography variant="subtitle2">Highlight Color</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="color"
          value={highlightColor}
          onChange={e => onHighlightColorChange(e.target.value)}
          style={{ width: 40, height: 40, padding: 0, border: 'none' }}
        />
        <TextField
          size="small"
          value={highlightColor}
          onChange={e => onHighlightColorChange(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Box>
      {!selectedRoomId && (
        <Typography variant="caption" color="text.secondary">
          Select a room to highlight it
        </Typography>
      )}
    </Box>
  );
};
