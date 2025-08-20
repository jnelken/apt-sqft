import React from 'react';
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ActionButtonsProps {
  onSubmit?: () => void;
  submitText?: string;
  submitDisabled?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showSubmit?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSubmit,
  submitText = 'Submit',
  submitDisabled = false,
  onDuplicate,
  onDelete,
  showSubmit = false,
}) => {
  return (
    <Box
      sx={{
        mt: 'auto',
        pt: 2,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1,
      }}>
      {showSubmit && onSubmit && (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={submitDisabled}>
          {submitText}
        </Button>
      )}
      {onDuplicate && (
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={onDuplicate}>
          Duplicate
        </Button>
      )}
      {onDelete && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}>
          Delete
        </Button>
      )}
    </Box>
  );
};
