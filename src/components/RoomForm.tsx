import React, { useEffect, useState } from 'react';
import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Room } from '@/lib/types';
import { BaseForm } from './BaseForm';
import { BaseFormData } from './BaseForm';

interface RoomFormProps {
  onSubmit: (room: Omit<Room, 'id' | 'points'>) => void;
  initialValues?: Partial<BaseFormData & { livability?: 'livable' | 'non-livable' | 'outdoor' }>;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  initialValues,
  onDelete,
  onDuplicate,
}) => {
  const [livability, setLivability] = useState<'livable' | 'non-livable' | 'outdoor'>(
    (initialValues?.livability as 'livable' | 'non-livable' | 'outdoor') || 'livable'
  );

  // Keep local state in sync if the edited room changes
  useEffect(() => {
    if (initialValues?.livability) {
      setLivability(initialValues.livability as 'livable' | 'non-livable' | 'outdoor');
    }
  }, [initialValues?.livability]);
  const handleSubmit = (data: any) => {
    onSubmit({
      name: data.name,
      height: data.height,
      width: data.width,
      sqFootage: (data.height * data.width) / 144,
      livability: livability,
      x: data.x,
      y: data.y,
    });
  };

  const livabilitySection = (
    <>
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Room Type
      </Typography>
      <ToggleButtonGroup
        value={livability}
        exclusive
        onChange={(_, newValue) => newValue && setLivability(newValue)}
        fullWidth
        color="primary"
        sx={{
          mb: 2,
          '& .MuiToggleButton-root.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
          },
        }}>
        <ToggleButton value="livable">Livable</ToggleButton>
        <ToggleButton value="non-livable">Non-Livable</ToggleButton>
        <ToggleButton value="outdoor">Outdoor</ToggleButton>
      </ToggleButtonGroup>
    </>
  );

  return (
    <BaseForm
      label="Room"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      additionalFields={livabilitySection}
    />
  );
};
