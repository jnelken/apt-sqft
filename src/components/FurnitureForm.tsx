import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Furniture } from '../types';
import { CompactTextField } from './ui/CompactTextField';
import { FURNITURE_TEMPLATES } from '../data/furnitureTemplates';

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
      isRelative: false,
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

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Height
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={formData.heightFeet}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              heightFeet: Math.max(0, Number(e.target.value)),
            }))
          }
          required
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={formData.heightInches}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              heightInches: Math.max(0, Math.min(11, Number(e.target.value))),
            }))
          }
          required
        />
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Width
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <CompactTextField
          label="Feet"
          type="number"
          value={formData.widthFeet}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              widthFeet: Math.max(0, Number(e.target.value)),
            }))
          }
          required
        />
        <CompactTextField
          label="Inches"
          type="number"
          value={formData.widthInches}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              widthInches: Math.max(0, Math.min(11, Number(e.target.value))),
            }))
          }
          required
        />
      </Box>

      {initialValues && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2 }}>
          Position: ({initialValues.x}, {initialValues.y})
        </Typography>
      )}

      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {initialValues ? 'Update' : 'Add'}
        </Button>
        {initialValues && onDuplicate && (
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={onDuplicate}>
            Dupe
          </Button>
        )}
        {initialValues && onDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}>
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );
};
