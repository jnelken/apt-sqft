'use client';

import React, { useState, ReactNode, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { CompactTextField } from './ui/CompactTextField';
import { DimensionSelector, DimensionValues } from './ui/DimensionSelector';
import { ActionButtons } from './ui/ActionButtons';
import { formatInitialDimensions } from '@/lib/utils/formatInitialDimensions';

const DEFAULTS_BY_LABEL = {
  Room: {
    height: 120,
    width: 240,
  },
  Furniture: {
    height: 120,
    width: 240,
  },
};

const generateX = () => window.innerWidth / 2;
const generateY = () => window.innerHeight / 2;
const generateName = (label: string) => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${label} ${letter}`;
};

const generateDefaultValues = (label: 'Room' | 'Furniture') => {
  const height = DEFAULTS_BY_LABEL[label].height;
  const width = DEFAULTS_BY_LABEL[label].width;
  return {
    name: generateName(label),
    height,
    width,
    ...formatInitialDimensions(height, width),
    x: generateX(),
    y: generateY(),
  };
};

export interface BaseFormData extends DimensionValues {
  name: string;
  x: number;
  y: number;
  height: number;
  width: number;
}

interface BaseFormProps {
  label: 'Room' | 'Furniture';
  initialValues?: Partial<BaseFormData>;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  additionalFields?: ReactNode;
}

export const BaseForm: React.FC<BaseFormProps> = ({
  label,
  initialValues,
  onSubmit,
  onDelete,
  onDuplicate,
  additionalFields,
}) => {
  const startingHeight =
    initialValues?.height || generateDefaultValues(label).height;
  const startingWidth =
    initialValues?.width || generateDefaultValues(label).width;

  const [formData, setFormData] = useState<BaseFormData>({
    ...generateDefaultValues(label),
    ...initialValues,
  });

  const [dimensions, setDimensions] = useState<DimensionValues>(
    formatInitialDimensions(startingHeight, startingWidth),
  );

  const { name, x, y } = formData;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHeight = dimensions.heightFeet * 12 + dimensions.heightInches;
    const totalWidth = dimensions.widthFeet * 12 + dimensions.widthInches;

    onSubmit({
      name,
      height: totalHeight,
      width: totalWidth,
      x,
      y,
    });
  };

  const handleDimensionChange = (dimensions: DimensionValues) => {
    setDimensions(dimensions);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit' : 'Add'} {label}
      </Typography>

      <CompactTextField
        label="Name"
        value={formData.name}
        onChange={handleNameChange}
        required
      />

      {additionalFields}

      <DimensionSelector values={dimensions} onChange={handleDimensionChange} />

      {initialValues && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2 }}>
          Position: ({initialValues.x}, {initialValues.y})
        </Typography>
      )}

      <ActionButtons
        onSubmit={() => {}}
        submitText={initialValues ? 'Update' : 'Add'}
        showSubmit={true}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </Box>
  );
};
