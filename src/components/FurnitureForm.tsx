import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Furniture } from '../types';
import { CompactTextField } from './ui/CompactTextField';
import { FURNITURE_TEMPLATES } from '../data/furnitureTemplates';
import { DimensionSelector } from './ui/DimensionSelector';
import { ActionButtons } from './ui/ActionButtons';

interface FurnitureFormProps {
  onSubmit: (furniture: Omit<Furniture, 'id' | 'points'>) => void;
  initialValues?: Partial<Furniture>;
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
  const [formData, setFormData] = useState({
    name: initialValues?.name || 'Furniture',
    heightFeet: Math.floor((initialValues?.height || 30) / 12),
    heightInches: (initialValues?.height || 30) % 12,
    widthFeet: Math.floor((initialValues?.width || 30) / 12),
    widthInches: (initialValues?.width || 30) % 12,
    type: initialValues?.type || 'Other',
    x: initialValues?.x || window.innerWidth / 2,
    y: initialValues?.y || window.innerHeight / 2,
  });

  // Update form data when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        name: initialValues.name || prev.name,
        heightFeet: Math.floor((initialValues.height || 0) / 12),
        heightInches: (initialValues.height || 0) % 12,
        widthFeet: Math.floor((initialValues.width || 0) / 12),
        widthInches: (initialValues.width || 0) % 12,
        type: initialValues.type || 'Other',
        x: initialValues.x || prev.x,
        y: initialValues.y || prev.y,
      }));
    }
  }, [initialValues]);

  const handleSwapDimensions = () => {
    setFormData(prev => ({
      ...prev,
      heightFeet: prev.widthFeet,
      heightInches: prev.widthInches,
      widthFeet: prev.heightFeet,
      widthInches: prev.heightInches,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHeight = formData.heightFeet * 12 + formData.heightInches;
    const totalWidth = formData.widthFeet * 12 + formData.widthInches;

    // Get template color if available, otherwise use default
    const template = findTemplateByType(formData.type);
    const defaultColor = template?.defaultColor || '#D2691E';

    onSubmit({
      name: formData.name,
      height: totalHeight,
      width: totalWidth,
      sqFootage: 0, // Furniture doesn't count towards sq footage
      roomType: 'non-livable', // Furniture is always non-livable
      type: formData.type,
      x: initialValues?.x || formData.x,
      y: initialValues?.y || formData.y,
      color: initialValues?.color || defaultColor,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Furniture' : 'Add New Furniture'}
      </Typography>

      <CompactTextField
        label="Furniture Name"
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />

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
              setFormData(prev => ({
                ...prev,
                type: newType,
                heightFeet: Math.floor(template.defaultHeight / 12),
                heightInches: template.defaultHeight % 12,
                widthFeet: Math.floor(template.defaultWidth / 12),
                widthInches: template.defaultWidth % 12,
                name: template.name, // Also update the name to match template
              }));
            } else {
              setFormData(prev => ({ ...prev, type: newType }));
            }
          }}>
          {FURNITURE_TYPES.map(type => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DimensionSelector
        heightFeet={formData.heightFeet}
        heightInches={formData.heightInches}
        widthFeet={formData.widthFeet}
        widthInches={formData.widthInches}
        onHeightFeetChange={value =>
          setFormData(prev => ({ ...prev, heightFeet: value }))
        }
        onHeightInchesChange={value =>
          setFormData(prev => ({ ...prev, heightInches: value }))
        }
        onWidthFeetChange={value =>
          setFormData(prev => ({ ...prev, widthFeet: value }))
        }
        onWidthInchesChange={value =>
          setFormData(prev => ({ ...prev, widthInches: value }))
        }
        onSwapDimensions={handleSwapDimensions}
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
        onSubmit={() => {}} // Form handles submit via onSubmit prop
        submitText={initialValues ? 'Update' : 'Add'}
        showSubmit={true}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </Box>
  );
};
