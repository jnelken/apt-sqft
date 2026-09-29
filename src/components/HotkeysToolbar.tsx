import React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StraightenIcon from '@mui/icons-material/Straighten';
import { EditorMode } from '@/lib/types';

interface HotkeyTool {
  mode: Exclude<EditorMode, 'select'>;
  label: string;
  shortcut: string;
  hint: string;
  Icon: typeof AspectRatioIcon;
}

export const HOTKEY_TOOLS: HotkeyTool[] = [
  {
    mode: 'scale',
    label: 'Scale',
    shortcut: 'S',
    hint: 'Hold S (or click), then drag an item up to grow it or down to shrink it',
    Icon: AspectRatioIcon,
  },
  {
    mode: 'ruler',
    label: 'Ruler',
    shortcut: 'Alt',
    hint: 'Hold Alt (or click), then drag to measure; hold Shift to snap to the grid',
    Icon: StraightenIcon,
  },
];

interface HotkeysToolbarProps {
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
}

export function HotkeysToolbar({
  editorMode,
  onEditorModeChange,
}: HotkeysToolbarProps) {
  return (
    <Toolbar
      variant="dense"
      role="toolbar"
      aria-label="Hotkeys"
      sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        value={editorMode === 'select' ? null : editorMode}
        onChange={(_, mode: EditorMode | null) =>
          onEditorModeChange(mode ?? 'select')
        }
      >
        {HOTKEY_TOOLS.map(({ mode, label, shortcut, hint, Icon }) => (
          <Tooltip key={mode} title={hint}>
            <ToggleButton
              value={mode}
              aria-label={`${label} (${shortcut})`}
              sx={{ gap: 1, textTransform: 'none' }}
            >
              <Icon fontSize="small" />
              {label}
              <Box
                component="kbd"
                sx={{
                  px: 0.75,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                }}
              >
                {shortcut}
              </Box>
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Toolbar>
  );
}
