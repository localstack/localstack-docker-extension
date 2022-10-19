import { Box, Card, IconButton, List, ListItem, TextField } from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import React, { ReactElement, useState } from "react";
import { v4 as uuid } from 'uuid';
import { useEnvVars } from "../service/hooks";

const DEFAULT_COLUMN_WIDTH = 2000;

export const StartOptions = (): ReactElement => {

  const { envVars, setEnvVars } = useEnvVars();
  const [newVar, setNewVar] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  const handleAddButtonPress = () => {
    setEnvVars([...envVars, { variable: newVar, value: newValue, id: uuid() }]);
    setNewVar('');
    setNewValue('');
  };

  const handleRemoveButtonPress = (id: string) => {
    setEnvVars(envVars.filter(item => item.id !== id));
  };

  return (
    <Card>
      <List>
        {envVars.map(item => (
          <ListItem key={item.id}>
            <Box p={2} display="flex" width={DEFAULT_COLUMN_WIDTH} key={item.id}>
              <TextField fullWidth variant="outlined" value={item.variable} />
              <TextField fullWidth variant="outlined" value={item.value} />
              <IconButton onClick={() => handleRemoveButtonPress(item.id)} >
                <RemoveCircleOutline />
              </IconButton>
            </Box>
          </ListItem>
        ))}
        <ListItem key='addItem'>
          <Box p={2} display="flex" width={DEFAULT_COLUMN_WIDTH} key='addItem' >
            <TextField
              fullWidth
              variant="outlined"
              label='Variable'
              onChange={(e) => setNewVar(e.target.value)}
              value={newVar}
            />
            <TextField
              fullWidth
              variant="outlined"
              label='Value'
              onChange={(e) => setNewValue(e.target.value)}
              value={newValue}
            />
            <IconButton onClick={handleAddButtonPress} >
              <AddCircleOutline />
            </IconButton>
          </Box>
        </ListItem>
      </List>
    </Card>
  );
};
