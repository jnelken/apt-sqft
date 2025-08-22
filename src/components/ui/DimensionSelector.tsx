'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { CompactTextField } from './CompactTextField';

export interface DimensionValues {
  heightFeet: number;
  heightInches: number;
  widthFeet: number;
  widthInches: number;
}

interface DimensionSelectorProps {
  initialValues: DimensionValues;
  onChange: (dimensions: DimensionValues) => void;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  initialValues,
  onChange,
}) => {
  const updateDimension = (key: keyof DimensionValues, value: number) => {
    const newDimensions = { ...initialValues, [key]: value };
    onChange(newDimensions);
  };

  const handleSwapDimensions = () => {
    const newDimensions: DimensionValues = {
      heightFeet: initialValues.widthFeet,
      heightInches: initialValues.widthInches,
      widthFeet: initialValues.heightFeet,
      widthInches: initialValues.heightInches,
    };
    onChange(newDimensions);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            'cursor': 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={handleSwapDimensions}>
          Height
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={initialValues.heightFeet}
          onChange={e =>
            updateDimension('heightFeet', Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={initialValues.heightInches}
          onChange={e =>
            updateDimension(
              'heightInches',
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
          onClick={handleSwapDimensions}>
          Width
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={initialValues.widthFeet}
          onChange={e =>
            updateDimension('widthFeet', Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={initialValues.widthInches}
          onChange={e =>
            updateDimension(
              'widthInches',
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
