import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  onThemeChange,
}) => {
  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton onClick={toggleTheme} size="small">
          {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
