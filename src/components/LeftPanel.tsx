import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface LeftPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function LeftPanel({ isOpen, onToggle, children }: LeftPanelProps) {
  return (
    <Box
      sx={{
        width: isOpen ? 300 : 0,
        borderRight: 1,
        borderColor: 'divider',
        transition: 'width 0.2s',
        overflow: 'hidden',
        position: 'relative',
      }}>
      {children}
      <IconButton
        onClick={onToggle}
        sx={{
          'position': 'absolute',
          'right': -20,
          'top': '50%',
          'transform': 'translateY(-50%)',
          'backgroundColor': 'background.paper',
          'border': 1,
          'borderColor': 'divider',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}>
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
    </Box>
  );
}
