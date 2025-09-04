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
  return {
    name: generateName(label),
    height: DEFAULTS_BY_LABEL[label].height,
    width: DEFAULTS_BY_LABEL[label].width,
    x: generateX(),
    y: generateY(),
  };
};

const formatInitialValues = (initialValues: Partial<BaseFormData>) => {
  return {
    ...initialValues,
    ...formatInitialDimensions(initialValues.height, initialValues.width),
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
  initialValues = {},
  onSubmit,
  onDelete,
  onDuplicate,
  additionalFields,
}) => {
  const [formData, setFormData] = useState<BaseFormData>({
    ...generateDefaultValues(label),
    ...formatInitialValues(initialValues),
  });

  const { height, width } = formData;

  const [dimensions, setDimensions] = useState<DimensionValues>(
    formatInitialDimensions(height, width),
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

  const handleDimensionChange = useCallback((dimensions: DimensionValues) => {
    setFormData(prev => ({ ...prev, ...dimensions }));
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, name: e.target.value }));
    },
    [],
  );

  // Determine if we are editing based on whether any initial values were provided
  const isEditing = Object.keys(initialValues).length > 0;

  // When parent updates initial height/width (e.g., furniture type change), sync into form
  useEffect(() => {
    if (
      typeof initialValues.height === 'number' &&
      typeof initialValues.width === 'number'
    ) {
      setFormData(prev => ({
        ...prev,
        height: initialValues.height as number,
        width: initialValues.width as number,
      }));
      setDimensions(
        formatInitialDimensions(
          initialValues.height as number,
          initialValues.width as number,
        ),
      );
    }
  }, [initialValues.height, initialValues.width]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit' : 'Add'} {label}
      </Typography>

      <CompactTextField
        label="Name"
        value={formData.name}
        onChange={handleNameChange}
        required
      />

      {additionalFields}

      <DimensionSelector values={dimensions} onChange={handleDimensionChange} />

      {isEditing && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2 }}>
          Position: ({initialValues.x}, {initialValues.y})
        </Typography>
      )}

      <ActionButtons
        onSubmit={() => {}}
        submitText={isEditing ? 'Update' : 'Add'}
        showSubmit={true}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </Box>
  );
};
