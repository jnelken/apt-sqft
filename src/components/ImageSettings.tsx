import React, { useRef } from 'react';
import { Box, IconButton, Slider, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

interface ImageSettingsProps {
  onImageUpload: (file: File) => void;
  imageScale: number;
  onImageScaleChange: (scale: number) => void;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({
  onImageUpload,
  imageScale,
  onImageScaleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <Tooltip title="Upload Floor Plan">
        <IconButton onClick={handleImageClick} size="small">
          <ImageIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Adjust image size">
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
          <Slider
            value={imageScale}
            onChange={(_event, value) => onImageScaleChange(value as number)}
            min={0.1}
            max={2}
            step={0.1}
            size="small"
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};
