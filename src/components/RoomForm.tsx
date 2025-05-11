import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Room } from '../types';

interface RoomFormProps {
  onSubmit: (room: Omit<Room, 'id' | 'points'>) => void;
  initialValues?: Partial<Room>;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  const [formData, setFormData] = useState({
    name: initialValues?.name || 'Room ' + letter,
    heightFeet: Math.floor((initialValues?.height || 120) / 12),
    heightInches: (initialValues?.height || 120) % 12,
    widthFeet: Math.floor((initialValues?.width || 240) / 12),
    widthInches: (initialValues?.width || 240) % 12,
    isLivable: initialValues?.isLivable ?? true,
    isRelative: initialValues?.isRelative ?? false,
    relativeTo: initialValues?.relativeTo || '',
    relativeRatio: initialValues?.relativeRatio || 1,
    x: initialValues?.x || window.innerWidth / 2,
    y: initialValues?.y || window.innerHeight / 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHeight = formData.heightFeet * 12 + formData.heightInches;
    const totalWidth = formData.widthFeet * 12 + formData.widthInches;
    onSubmit({
      ...formData,
      height: totalHeight,
      width: totalWidth,
      sqFootage: totalHeight * totalWidth,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Room' : 'Add New Room'}
      </Typography>

      <TextField
        fullWidth
        label="Room Name"
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        margin="normal"
        required
      />

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Height
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
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
        <TextField
          fullWidth
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
        <TextField
          fullWidth
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
        <TextField
          fullWidth
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

      <FormControlLabel
        control={
          <Switch
            checked={formData.isLivable}
            onChange={e =>
              setFormData(prev => ({ ...prev, isLivable: e.target.checked }))
            }
          />
        }
        label="Livable Space"
      />

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
          <TextField
            fullWidth
            label="Relative To Room"
            value={formData.relativeTo}
            onChange={e =>
              setFormData(prev => ({ ...prev, relativeTo: e.target.value }))
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Relative Ratio"
            type="number"
            value={formData.relativeRatio}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                relativeRatio: Number(e.target.value),
              }))
            }
            margin="normal"
            required
          />
        </>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}>
        {initialValues ? 'Update Room' : 'Add Room'}
      </Button>
    </Box>
  );
};
