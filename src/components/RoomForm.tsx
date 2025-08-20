import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Room } from '../types';
import { CompactTextField } from './ui/CompactTextField';
import { DimensionSelector } from './ui/DimensionSelector';
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
    isRelative: initialValues?.isRelative ?? false,
    relativeTo: initialValues?.relativeTo || '',
    relativeRatio: initialValues?.relativeRatio || 1,
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
        isRelative: initialValues.isRelative ?? false,
        relativeTo: initialValues.relativeTo || '',
        relativeRatio: initialValues.relativeRatio || 1,
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
    onSubmit({
      name: formData.name,
      height: totalHeight,
      width: totalWidth,
      sqFootage: (totalHeight * totalWidth) / 144,
      roomType: formData.roomType,
      isRelative: formData.isRelative,
      relativeTo: formData.relativeTo,
      relativeRatio: formData.relativeRatio,
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

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Room Type
      </Typography>
      <ToggleButtonGroup
        value={formData.roomType}
        exclusive
        onChange={(e, value) =>
          value && setFormData(prev => ({ ...prev, roomType: value }))
        }
        fullWidth
        sx={{ mb: 2 }}>
        <ToggleButton value="livable">Livable</ToggleButton>
        <ToggleButton value="non-livable">Non-Livable</ToggleButton>
        <ToggleButton value="outdoor">Outdoor</ToggleButton>
      </ToggleButtonGroup>

      <FormControlLabel
        control={
          <Switch
            checked={formData.isRelative}
            onChange={e =>
              setFormData(prev => ({ ...prev, isRelative: e.target.checked }))
            }
          />
        }
        label="Relative Size"
      />

      {formData.isRelative && (
        <>
          <CompactTextField
            label="Relative To Room"
            value={formData.relativeTo}
            onChange={e =>
              setFormData(prev => ({ ...prev, relativeTo: e.target.value }))
            }
            required
          />

          <CompactTextField
            label="Relative Ratio"
            type="number"
            value={formData.relativeRatio}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                relativeRatio: Number(e.target.value),
              }))
            }
            required
          />
        </>
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
