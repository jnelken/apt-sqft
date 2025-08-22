import { useCallback } from 'react';
import { AppState } from '@/lib/types';

interface UseAppSettingsProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface UseAppSettingsReturn {
  handleGridSizeChange: (newSize: number) => void;
  handleGridOpacityChange: (opacity: number) => void;
  handleZoomChange: (newZoom: number) => void;
  handleThemeChange: (newTheme: 'light' | 'dark') => void;
  handleWallColorChange: (color: string) => void;
  handleHighlightColorChange: (color: string) => void;
}

export const useAppSettings = ({
  appState,
  setAppState,
}: UseAppSettingsProps): UseAppSettingsReturn => {
  const handleGridSizeChange = useCallback((newSize: number) => {
    setAppState(prev => ({
      ...prev,
      gridSize: newSize,
    }));
  }, [setAppState]);

  const handleGridOpacityChange = useCallback((opacity: number) => {
    setAppState(prev => ({
      ...prev,
      gridOpacity: opacity,
    }));
  }, [setAppState]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setAppState(prev => ({ ...prev, zoom: newZoom }));
  }, [setAppState]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setAppState(prev => ({ ...prev, theme: newTheme }));
  }, [setAppState]);

  const handleWallColorChange = useCallback((color: string) => {
    setAppState(prev => ({
      ...prev,
      wallColor: color,
    }));
  }, [setAppState]);

  const handleHighlightColorChange = useCallback((color: string) => {
    setAppState(prev => ({ ...prev, highlightColor: color }));
  }, [setAppState]);

  return {
    handleGridSizeChange,
    handleGridOpacityChange,
    handleZoomChange,
    handleThemeChange,
    handleWallColorChange,
    handleHighlightColorChange,
  };
};