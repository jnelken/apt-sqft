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
    height: initialValues?.height || 120,
    width: initialValues?.width || 240,
    isLivable: initialValues?.isLivable ?? true,
    isRelative: initialValues?.isRelative ?? false,
    relativeTo: initialValues?.relativeTo || '',
    relativeRatio: initialValues?.relativeRatio || 1,
    x: initialValues?.x || window.innerWidth / 2,
    y: initialValues?.y || window.innerHeight / 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sqFootage: formData.height * formData.width,
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

      <TextField
        fullWidth
        label="Height (inches)"
        type="number"
        value={formData.height}
        onChange={e =>
          setFormData(prev => ({ ...prev, height: Number(e.target.value) }))
        }
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Width (inches)"
        type="number"
        value={formData.width}
        onChange={e =>
          setFormData(prev => ({ ...prev, width: Number(e.target.value) }))
        }
        margin="normal"
        required
      />

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
