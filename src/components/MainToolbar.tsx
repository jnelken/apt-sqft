import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { FloorPlanName } from './FloorPlanName';
import { GridSettings } from './GridSettings';
import { ColorSettings } from './ColorSettings';
import { ZoomControls } from './ZoomControls';
import { ImageSettings } from './ImageSettings';
import { Settings } from './Settings';
import { ThemeSwitcher } from './ThemeSwitcher';

interface MainToolbarProps {
  floorPlanName: string;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  wallColor: string;
  onWallColorChange: (color: string) => void;
  selectedRoomId: string | null;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onImageUpload: (file: File) => void;
  imageScale: number;
  onImageScaleChange: (scale: number) => void;
  gridOpacity: number;
  onGridOpacityChange: (opacity: number) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function MainToolbar({
  floorPlanName,
  onNameChange,
  onDelete,
  gridSize,
  onGridSizeChange,
  wallColor,
  onWallColorChange,
  selectedRoomId,
  highlightColor,
  onHighlightColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  onImageUpload,
  imageScale,
  onImageScaleChange,
  gridOpacity,
  onGridOpacityChange,
  theme,
  onThemeChange,
}: MainToolbarProps) {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense">
        <FloorPlanName
          name={floorPlanName}
          onNameChange={onNameChange}
          onDelete={onDelete}
        />
        <Box sx={{ width: 16 }} />
        <GridSettings
          gridSize={gridSize}
          onGridSizeChange={onGridSizeChange}
        />
        <Box sx={{ width: 16 }} />
        <ColorSettings
          wallColor={wallColor}
          onWallColorChange={onWallColorChange}
          selectedRoomId={selectedRoomId}
          highlightColor={highlightColor}
          onHighlightColorChange={onHighlightColorChange}
        />
        <Box sx={{ width: 16 }} />
        <Tooltip title="Undo (⌘Z)">
          <span>
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}>
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (⌘⇧Z)">
          <span>
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}>
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <ZoomControls
          zoom={zoom}
          onZoomChange={onZoomChange}
        />
        <Box sx={{ width: 16 }} />
        <ImageSettings
          onImageUpload={onImageUpload}
          imageScale={imageScale}
          onImageScaleChange={onImageScaleChange}
        />
        <Box sx={{ width: 16 }} />
        <Settings
          gridOpacity={gridOpacity}
          onGridOpacityChange={onGridOpacityChange}
        />
        <Box sx={{ width: 16 }} />
        <ThemeSwitcher
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </Toolbar>
    </AppBar>
  );
}
