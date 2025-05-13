import React from 'react';
import { TextField, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface FloorPlanNameProps {
  name: string;
  onNameChange: (name: string) => void;
  onDelete: () => void;
}

export const FloorPlanName: React.FC<FloorPlanNameProps> = ({
  name,
  onNameChange,
  onDelete,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <TextField
        size="small"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        placeholder="Floor Plan Name"
        sx={{
          'width': 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
      />
      <Tooltip title="Clear floor plan">
        <IconButton size="small" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};
