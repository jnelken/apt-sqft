import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Furniture } from '../lib/types';

interface FurnitureListProps {
  furniture: Furniture[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const FurnitureList: React.FC<FurnitureListProps> = ({
  furniture,
  selectedRoomId,
  onRoomSelect,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Furniture List
      </Typography>
      <Paper>
        <List>
          {furniture.length === 0 ? (
            <ListItem>
              <ListItemText primary="No furniture added" />
            </ListItem>
          ) : (
            furniture.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedRoomId === item.id}
                    onClick={() => onRoomSelect(item.id)}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.type} - ${item.width}in × ${item.height}in`}
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};
