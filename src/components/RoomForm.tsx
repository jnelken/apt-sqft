import React from 'react';
import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Room } from '@/lib/types';
import { BaseForm } from './BaseForm';
import { BaseFormData } from './BaseForm';

interface RoomFormProps {
  onSubmit: (room: Omit<Room, 'id' | 'points'>) => void;
  initialValues?: Partial<BaseFormData>;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  initialValues,
  onDelete,
  onDuplicate,
}) => {
  const handleSubmit = (data: any) => {
    onSubmit({
      name: data.name,
      height: data.height,
      width: data.width,
      sqFootage: (data.height * data.width) / 144,
      livability: data.livability,
      x: data.x,
      y: data.y,
    });
  };

  const getlivabilitySection = (
    value: string,
    onChange: (field: string, value: any) => void,
  ) => (
    <>
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Room Type
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => newValue && onChange('livability', newValue)}
        fullWidth
        sx={{ mb: 2 }}>
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
      additionalFields={getlivabilitySection}
      additionalFormData={{
        livability: initialValues?.livability || 'livable',
      }}
    />
  );
};
