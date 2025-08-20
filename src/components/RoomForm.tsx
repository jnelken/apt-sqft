import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Room } from '../types';
import { CompactTextField } from './ui/CompactTextField';
import { DimensionSelector, DimensionValues } from './ui/DimensionSelector';
import { ActionButtons } from './ui/ActionButtons';

interface RoomFormProps {
  onSubmit: (room: Omit<Room, 'id' | 'points'>) => void;
  initialValues?: Partial<Room>;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  initialValues,
  onDelete,
  onDuplicate,
}) => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  const [formData, setFormData] = useState({
    name: initialValues?.name || 'Room ' + letter,
    heightFeet: Math.floor((initialValues?.height || 120) / 12),
    heightInches: (initialValues?.height || 120) % 12,
    widthFeet: Math.floor((initialValues?.width || 240) / 12),
    widthInches: (initialValues?.width || 240) % 12,
    roomType: initialValues?.roomType || 'livable',
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
        roomType: initialValues.roomType || 'livable',
        x: initialValues.x || prev.x,
        y: initialValues.y || prev.y,
      }));
    }
  }, [initialValues]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHeight = formData.heightFeet * 12 + formData.heightInches;
    const totalWidth = formData.widthFeet * 12 + formData.widthInches;
    onSubmit({
      name: formData.name,
      height: totalHeight,
      width: totalWidth,
      sqFootage: (totalHeight * totalWidth) / 144,
      roomType: formData.roomType,
      x: initialValues?.x || formData.x,
      y: initialValues?.y || formData.y,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Room' : 'Add Room'}
      </Typography>

      <CompactTextField
        label="Name"
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />

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

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Room Type
      </Typography>
      <ToggleButtonGroup
        value={formData.roomType}
        exclusive
        onChange={(_, value) =>
          value && setFormData(prev => ({ ...prev, roomType: value }))
        }
        fullWidth
        sx={{ mb: 2 }}>
        <ToggleButton value="livable">Livable</ToggleButton>
        <ToggleButton value="non-livable">Non-Livable</ToggleButton>
        <ToggleButton value="outdoor">Outdoor</ToggleButton>
      </ToggleButtonGroup>


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
