import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export const CompactTextField: React.FC<TextFieldProps> = props => {
  return (
    <TextField
      size="small"
      fullWidth
      margin="dense"
      {...props}
      sx={{
        '& .MuiInputBase-root': {
          height: '32px',
        },
        ...props.sx,
      }}
    />
  );
};
