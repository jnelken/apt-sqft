'use client';

import React, { useState, ReactNode } from 'react';
import {
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { BaseForm, BaseFormData } from './BaseForm';
import { Room, Furniture } from '@/lib/types';
import {
  FURNITURE_TYPES,
  FURNITURE_TEMPLATES,
} from '@/lib/constants/furniture.constants';

type EntityLabel = 'Room' | 'Furniture';

type RoomItemFormProps = {
  label: 'Room';
  onSubmit: (room: Omit<Room, 'id' | 'points'>) => void;
  initialValues?: Partial<
    BaseFormData & {
      livability?: 'livable' | 'non-livable' | 'outdoor';
    }
  >;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

type FurnitureItemFormProps = {
  label: 'Furniture';
  onSubmit: (furniture: Omit<Furniture, 'id' | 'points'>) => void;
  initialValues?: Partial<
    BaseFormData & {
      type?: string;
      color?: string;
    }
  >;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

type ItemFormProps = RoomItemFormProps | FurnitureItemFormProps;

export const ItemForm: React.FC<ItemFormProps> = (props) => {
  const { label, onDelete, onDuplicate } = props;
  const roomInitialValues =
    label === 'Room' ? (props as RoomItemFormProps).initialValues : undefined;
  const furnitureInitialValues =
    label === 'Furniture'
      ? (props as FurnitureItemFormProps).initialValues
      : undefined;
  // Room-specific state
  const [livability, setLivability] = useState<
    'livable' | 'non-livable' | 'outdoor'
  >(
    (roomInitialValues?.livability as 'livable' | 'non-livable' | 'outdoor') ||
      'livable',
  );

  // Furniture-specific state
  const [type, setType] = useState<string>(
    furnitureInitialValues?.type || 'Bed',
  );
  const getTemplateByType = (furnitureType: string) =>
    FURNITURE_TEMPLATES.find((t) => t.type === furnitureType);

  const furnitureTemplate = getTemplateByType(type);

  const [furnitureHeight, setFurnitureHeight] = useState<number>(
    furnitureInitialValues?.height || furnitureTemplate?.defaultHeight || 80,
  );
  const [furnitureWidth, setFurnitureWidth] = useState<number>(
    furnitureInitialValues?.width || furnitureTemplate?.defaultWidth || 60,
  );

  const handleSubmit = (data: BaseFormData) => {
    if (label === 'Room') {
      const room: Omit<Room, 'id' | 'points'> = {
        name: data.name,
        height: data.height,
        width: data.width,
        sqFootage: (data.height * data.width) / 144,
        livability,
        x: data.x,
        y: data.y,
      };
      (props as RoomItemFormProps).onSubmit(room);
    } else {
      const template = getTemplateByType(type);
      const defaultColor =
        furnitureInitialValues?.color || template?.defaultColor || '#D2691E';
      const furniture: Omit<Furniture, 'id' | 'points'> = {
        name: data.name,
        height: data.height,
        width: data.width,
        sqFootage: 0,
        livability: 'non-livable',
        type,
        x: data.x,
        y: data.y,
        color: (furnitureInitialValues as any)?.color || defaultColor,
      };
      (props as FurnitureItemFormProps).onSubmit(furniture);
    }
  };

  let additionalFields: ReactNode = null;
  if (label === 'Room') {
    additionalFields = (
      <>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Room Type
        </Typography>
        <ToggleButtonGroup
          value={livability}
          exclusive
          onChange={(_, newValue) => newValue && setLivability(newValue)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="livable">Livable</ToggleButton>
          <ToggleButton value="non-livable">Non-Livable</ToggleButton>
          <ToggleButton value="outdoor">Outdoor</ToggleButton>
        </ToggleButtonGroup>
      </>
    );
  } else {
    additionalFields = (
      <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
        <InputLabel>Furniture Type</InputLabel>
        <Select
          value={type}
          label="Furniture Type"
          onChange={(e) => {
            const newType = e.target.value as string;
            const template = getTemplateByType(newType);
            setType(newType);
            if (template) {
              setFurnitureHeight(template.defaultHeight);
              setFurnitureWidth(template.defaultWidth);
            }
          }}
        >
          {FURNITURE_TYPES.map((ft) => (
            <MenuItem key={ft} value={ft}>
              {ft}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const mergedInitialValues =
    label === 'Furniture'
      ? {
          ...(furnitureInitialValues || {}),
          height: furnitureHeight,
          width: furnitureWidth,
        }
      : roomInitialValues;

  return (
    <BaseForm
      label={label}
      initialValues={mergedInitialValues}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      additionalFields={additionalFields}
    />
  );
};
