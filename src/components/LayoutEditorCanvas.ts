import { styled } from '@mui/material/styles';
import { EditorMode } from '@/lib/types';

export const MODE_CURSORS: Record<EditorMode, string | undefined> = {
  select: undefined,
  scale: 'ns-resize',
  ruler: 'crosshair',
};

/** position relative container */
export const EditorContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  fontSize: '1px',
}));

/** Centered zoom container */
export const EditorContent = styled('div')<{ zoom: number }>(({ zoom }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%) scale(${zoom})`,
  transformOrigin: 'center center',
  width: '100%',
  height: '100%',
}));

export const Grid = styled('div')<{ gridSize: number; opacity: number }>(
  ({ theme, gridSize, opacity }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
    linear-gradient(to right, ${theme.palette.primary.main}${Math.round(
      opacity * 255,
    )
      .toString(16)
      .padStart(2, '0')} 1px, transparent 1px),
    linear-gradient(to bottom, ${theme.palette.primary.main}${Math.round(
      opacity * 255,
    )
      .toString(16)
      .padStart(2, '0')} 1px, transparent 1px)
      `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  }),
);

export const BackgroundImage = styled('div')<{
  scale: number;
  imageUrl: string;
}>(({ theme, scale, imageUrl }) => ({
  opacity: 0.5,
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  transform: `scale(${scale})`,
  transformOrigin: 'top left',
  pointerEvents: 'none',
  filter: theme.palette.mode === 'dark' ? 'invert(1) brightness(0.6)' : 'none',
}));
