import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export const CompactTextField: React.FC<TextFieldProps> = props => {
  return <TextField size="small" margin="dense" {...props} />;
};
