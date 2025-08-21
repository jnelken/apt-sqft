import React, { useState, useEffect, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { CompactTextField } from './ui/CompactTextField';
import { DimensionSelector, DimensionValues } from './ui/DimensionSelector';
import { ActionButtons } from './ui/ActionButtons';
import { formatInitialDimensions } from '../lib/utils/formatInitialDimensions';

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
export interface BaseFormData extends DimensionValues {
  name: string;
  x: number;
  y: number;
  [key: string]: any;
}

interface BaseFormProps {
  label: 'Room' | 'Furniture';
  initialValues?: Partial<BaseFormData>;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  additionalFields?:
    | ReactNode
    | ((
        formData: any,
        onChange: (field: string, value: any) => void,
      ) => ReactNode);
  additionalFormData?: { type?: string } | { livability?: string };
  onAdditionalFieldChange?: (field: string, value: any) => void;
}

const calculateFeet = (inches: number) => Math.floor(inches / 12);
const calculateInches = (inches: number) => inches % 12;

export const BaseForm: React.FC<BaseFormProps> = ({
  label,
  initialValues,
  onSubmit,
  onDelete,
  onDuplicate,
  additionalFields,
  additionalFormData = {},
  onAdditionalFieldChange,
}) => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const defaultName = initialValues?.name || `${label} ${letter}`;
  const defaultHeight = DEFAULTS_BY_LABEL[label].height;
  const defaultWidth = DEFAULTS_BY_LABEL[label].width;
  const [formData, setFormData] = useState<BaseFormData>({
    ...initialValues,
    name: defaultName,
    heightFeet: calculateFeet(initialValues?.height || defaultHeight),
    heightInches: calculateInches(initialValues?.height || defaultHeight),
    widthFeet: calculateFeet(initialValues?.width || defaultWidth),
    widthInches: calculateInches(initialValues?.width || defaultWidth),
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    ...additionalFormData,
  });

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        name: initialValues.name || prev.name,
        ...formatInitialDimensions(initialValues.height, initialValues.width),
        x: initialValues.x || prev.x,
        y: initialValues.y || prev.y,
        ...additionalFormData,
      }));
    }
  }, [initialValues, additionalFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHeight = formData.heightFeet * 12 + formData.heightInches;
    const totalWidth = formData.widthFeet * 12 + formData.widthInches;

    const {
      heightFeet,
      heightInches,
      widthFeet,
      widthInches,
      ...otherFormData
    } = formData;

    onSubmit({
      ...otherFormData,
      height: totalHeight,
      width: totalWidth,
      x: initialValues?.x || formData.x,
      y: initialValues?.y || formData.y,
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (onAdditionalFieldChange) {
      onAdditionalFieldChange(field, value);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit' : 'Add'} {label}
      </Typography>

      <CompactTextField
        label="Name"
        value={formData.name}
        onChange={e => handleFieldChange('name', e.target.value)}
        required
      />

      {typeof additionalFields === 'function'
        ? additionalFields(formData, handleFieldChange)
        : additionalFields}

      <DimensionSelector
        initialValues={{
          heightFeet: formData.heightFeet,
          heightInches: formData.heightInches,
          widthFeet: formData.widthFeet,
          widthInches: formData.widthInches,
        }}
        onChange={(dimensions: DimensionValues) =>
          setFormData(prev => ({ ...prev, ...dimensions }))
        }
      />

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
