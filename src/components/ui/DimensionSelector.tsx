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
  values: DimensionValues;
  onChange: (dimensions: DimensionValues) => void;
}

const swapDimensions = (d: DimensionValues): DimensionValues => {
  return {
    heightFeet: d.widthFeet,
    heightInches: d.widthInches,
    widthFeet: d.heightFeet,
    widthInches: d.heightInches,
  };
};

export const DimensionSelector = ({
  values,
  onChange,
}: DimensionSelectorProps) => {
  const updateDimension = (key: keyof DimensionValues, value: number) => {
    const newDimensions = { ...values, [key]: value };
    onChange(newDimensions);
  };

  const handleSwapDimensions = () => {
    const newDimensions = swapDimensions(values);
    onChange(newDimensions);
  };

  const { heightFeet, heightInches, widthFeet, widthInches } = values;

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
          value={heightFeet}
          onChange={e =>
            updateDimension('heightFeet', Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={heightInches}
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
          value={widthFeet}
          onChange={e =>
            updateDimension('widthFeet', Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={widthInches}
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
