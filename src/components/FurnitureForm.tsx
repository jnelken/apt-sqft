import React, { useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Furniture } from '@/lib/types';
import {
  FURNITURE_TEMPLATES,
  FURNITURE_TEMPLATES_MAP,
  FURNITURE_TYPES,
} from '@/lib/constants/furniture.constants';
import { BaseForm, BaseFormData } from './BaseForm';
import { formatInitialDimensions } from '@/lib/utils/formatInitialDimensions';

interface FurnitureFormProps {
  onSubmit: (furniture: Omit<Furniture, 'id' | 'points'>) => void;
  initialValues?: Partial<BaseFormData & { type?: string; color?: string }>;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const FurnitureForm: React.FC<FurnitureFormProps> = ({
  onSubmit,
  initialValues,
  onDelete,
  onDuplicate,
}) => {
  const [type, setType] = useState(initialValues?.type || 'Bed');
  
  // Get template by type, not by ID
  const getTemplateByType = (furnitureType: string) => {
    return FURNITURE_TEMPLATES.find(template => template.type === furnitureType);
  };
  
  const [height, setHeight] = useState(
    initialValues?.height || getTemplateByType(type)?.defaultHeight || 80,
  );
  const [width, setWidth] = useState(
    initialValues?.width || getTemplateByType(type)?.defaultWidth || 60,
  );

  const handleSubmit = (data: BaseFormData) => {
    // Get template color if available, otherwise use default
    const template = getTemplateByType(type);
    const defaultColor =
      initialValues?.color || template?.defaultColor || '#D2691E';

    const newFurnitureItem: Omit<Furniture, 'id' | 'points'> = {
      name: data.name,
      height: data.height,
      width: data.width,
      sqFootage: 0, // Furniture doesn't count towards sq footage
      livability: 'non-livable', // Furniture is always non-livable
      type: type,
      x: data.x,
      y: data.y,
      color: (initialValues as any)?.color || defaultColor,
    };

    onSubmit(newFurnitureItem);
  };

  const furnitureTypeSection = (
    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
      <InputLabel>Furniture Type</InputLabel>
      <Select
        value={type}
        label="Furniture Type"
        onChange={e => {
          const newType = e.target.value;
          const template = getTemplateByType(newType);
          setType(newType);
          if (template) {
            setHeight(template.defaultHeight);
            setWidth(template.defaultWidth);
          }
        }}>
        {FURNITURE_TYPES.map(furnitureType => (
          <MenuItem key={furnitureType} value={furnitureType}>
            {furnitureType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <BaseForm
      label="Furniture"
      initialValues={{
        ...initialValues,
        height,
        width,
      }}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      additionalFields={furnitureTypeSection}
    />
  );
};
