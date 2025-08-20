import React from 'react';
import { Box, Typography } from '@mui/material';
import { CompactTextField } from './CompactTextField';

interface DimensionSelectorProps {
  heightFeet: number;
  heightInches: number;
  widthFeet: number;
  widthInches: number;
  onHeightFeetChange: (value: number) => void;
  onHeightInchesChange: (value: number) => void;
  onWidthFeetChange: (value: number) => void;
  onWidthInchesChange: (value: number) => void;
  onSwapDimensions: () => void;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  heightFeet,
  heightInches,
  widthFeet,
  widthInches,
  onHeightFeetChange,
  onHeightInchesChange,
  onWidthFeetChange,
  onWidthInchesChange,
  onSwapDimensions,
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            'cursor': 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={onSwapDimensions}>
          Height
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={heightFeet}
          onChange={e =>
            onHeightFeetChange(Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={heightInches}
          onChange={e =>
            onHeightInchesChange(
              Math.max(0, Math.min(11, Number(e.target.value))),
            )
          }
          required
          sx={{ width: 64, height: 40 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            'cursor': 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={onSwapDimensions}>
          Width
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={widthFeet}
          onChange={e => onWidthFeetChange(Math.max(0, Number(e.target.value)))}
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={widthInches}
          onChange={e =>
            onWidthInchesChange(
              Math.max(0, Math.min(11, Number(e.target.value))),
            )
          }
          required
          sx={{ width: 64, height: 40 }}
        />
      </Box>
    </>
  );
};
