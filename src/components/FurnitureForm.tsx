import React from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Furniture } from '../types';
import { FURNITURE_TEMPLATES } from '../data/furnitureTemplates';
import { BaseForm, BaseFormData } from './BaseForm';
import { formatInitialDimensions } from '../lib/utils/formatInitialDimensions';

interface FurnitureFormProps {
  onSubmit: (furniture: Omit<Furniture, 'id' | 'points'>) => void;
  initialValues?: Partial<BaseFormData>;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

// Get unique furniture types from templates
const FURNITURE_TYPES = Array.from(
  new Set(FURNITURE_TEMPLATES.map(template => template.type)),
).sort();

export const FurnitureForm: React.FC<FurnitureFormProps> = ({
  onSubmit,
  initialValues,
  onDelete,
  onDuplicate,
}) => {
  // Helper function to find template by type
  const findTemplateByType = (type: string) => {
    return FURNITURE_TEMPLATES.find(template => template.type === type);
  };

  const handleSubmit = (data: any) => {
    // Get template color if available, otherwise use default
    const template = findTemplateByType(data.type);
    const defaultColor =
      initialValues?.color || template?.defaultColor || '#D2691E';

    onSubmit({
      name: data.name,
      height: data.height,
      width: data.width,
      sqFootage: 0, // Furniture doesn't count towards sq footage
      livability: 'non-livable', // Furniture is always non-livable
      type: data.type,
      x: data.x,
      y: data.y,
      color: data.color || defaultColor,
    });
  };

  const getFurnitureTypeSection = (
    formData: any,
    onChange: (field: string, value: any) => void,
  ) => (
    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
      <InputLabel>Furniture Type</InputLabel>
      <Select
        value={formData.type}
        label="Furniture Type"
        onChange={e => {
          const newType = e.target.value;
          const template = findTemplateByType(newType);

          // Update type and dimensions if template found
          if (template && !initialValues) {
            // Only update dimensions for new furniture, not when editing existing
            const dimensions = formatInitialDimensions(
              template.defaultHeight,
              template.defaultWidth,
            );
            onChange('type', newType);
            onChange('name', template.name);
            onChange('heightFeet', dimensions.heightFeet);
            onChange('heightInches', dimensions.heightInches);
            onChange('widthFeet', dimensions.widthFeet);
            onChange('widthInches', dimensions.widthInches);
          } else {
            onChange('type', newType);
          }
        }}>
        {FURNITURE_TYPES.map(type => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <BaseForm
      label="Furniture"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      additionalFields={getFurnitureTypeSection}
      additionalFormData={{ type: initialValues?.type || 'Other' }}
    />
  );
};
