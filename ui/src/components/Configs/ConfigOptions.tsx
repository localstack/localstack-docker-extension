import { Box, Card, IconButton, List, ListItem, TextField } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import React, { ReactElement, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useRunConfig } from '../../services/hooks';
import { RunConfig } from '../../types';

const DEFAULT_COLUMN_WIDTH = 2000;

type Props = {
  config: RunConfig;
};

export const ConfigOptions = ({ config }: Props): ReactElement => {

  const { runConfig, setRunConfig } = useRunConfig();
  const [newVar, setNewVar] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  const handleAddButtonPress = () => {
    setRunConfig([...runConfig,
      {
        name: config.name, id: config.id, vars: [...config.vars,
          { variable: newVar, value: newValue, id: uuid() }],
      }]);
    setNewVar('');
    setNewValue('');
  };

  const handleRemoveButtonPress = (id: string) => {
    setRunConfig(runConfig.map(config1 => 
      config1.id !== config.id ?
        config1 :
        { id: config1.id, name: config1.name, vars: config1.vars?.filter(item => item?.id !== id) || [] } as RunConfig,
    ));
  };

  return (
    <Card>
      <List>
        {config.vars.map(item => (
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
