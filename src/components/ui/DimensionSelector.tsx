import React, { useState, useEffect } from 'react';
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
  const [dimensions, setDimensions] = useState<DimensionValues>(initialValues);

  useEffect(() => {
    setDimensions(initialValues);
  }, [initialValues]);

  const updateDimension = (key: keyof DimensionValues, value: number) => {
    const newDimensions = { ...dimensions, [key]: value };
    setDimensions(newDimensions);
    onChange(newDimensions);
  };

  const handleSwapDimensions = () => {
    const newDimensions: DimensionValues = {
      heightFeet: dimensions.widthFeet,
      heightInches: dimensions.widthInches,
      widthFeet: dimensions.heightFeet,
      widthInches: dimensions.heightInches,
    };
    setDimensions(newDimensions);
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
          value={dimensions.heightFeet}
          onChange={e =>
            updateDimension('heightFeet', Math.max(0, Number(e.target.value)))
          }
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={dimensions.heightInches}
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
          value={dimensions.widthFeet}
          onChange={e => updateDimension('widthFeet', Math.max(0, Number(e.target.value)))}
          required
          sx={{ width: 64, height: 40 }}
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={dimensions.widthInches}
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
