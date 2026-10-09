import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { AppState } from '@/lib/types';

export const useAppTheme = (mode: AppState['theme']) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Geist, sans-serif',
        },
        palette: {
          mode,
          primary: {
            main: '#2F4F4F',
          },
        },
      }),
    [mode],
  );
