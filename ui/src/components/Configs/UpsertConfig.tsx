import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  TextField,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import React, { ReactElement, useState } from "react";
import { v4 as uuid } from 'uuid';
import { useRunConfig } from "../../service/hooks";
import { RunConfig } from "../../types";

const DEFAULT_COLUMN_WIDTH = 2000;

type Props = {
  config?: RunConfig,
  open: boolean,
  onClose: () => void;
};

export const UpsertConfig = ({ config, open, onClose }: Props): ReactElement => {

  const { runConfig, setRunConfig } = useRunConfig();
  const [newVar, setNewVar] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [configName, setConfigName] = useState<string>(config?.name || '');
  const [newConfig, setNewConfig] = useState<RunConfig>(config || { name: '', vars: [] } as RunConfig);

  const handleAddButtonPress = () => {
    setNewConfig({
      name: newConfig.name, id: newConfig.id || uuid(), vars: [...newConfig.vars,
        { variable: newVar, value: newValue, id: uuid() }],
    });
    setNewVar('');
    setNewValue('');
  };

  const handleSaveButtonPress = () => {
    setRunConfig([...runConfig.filter(config_1 => config_1.id !== newConfig.id),
      {
        name: configName, id: newConfig.id, vars: newConfig.vars,
      }]);
    onClose();
  };

  const handleRemoveButtonPress = (id: string) => {
    setNewConfig({
      name: newConfig.name, id: newConfig.id || uuid(), vars: newConfig.vars?.filter(item => item?.id !== id) || [],
    });
  };

  const handleDeleteButtonPress = () => {
    if (newConfig.id) {
      setRunConfig(runConfig.filter(config_1 => config_1.id !== newConfig.id));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Card>
          <Box p={2} display="flex" width='full' >
            <TextField
              fullWidth
              variant="outlined"
              label='Configuration Name'
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
            />
          </Box>
          <List>
            {newConfig?.vars.map(item => (
              <ListItem key={item.id}>
                <Box p={2} display="flex" width={DEFAULT_COLUMN_WIDTH} key={item.id}>
                  <TextField fullWidth variant="outlined" disabled={true} value={item.variable} />
                  <TextField fullWidth variant="outlined" disabled={true} value={item.value} />
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
                  style={{ margin: 5 }}
                  value={newVar}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label='Value'
                  onChange={(e) => setNewValue(e.target.value)}
                  style={{ margin: 5 }}
                  value={newValue}
                />
                <IconButton onClick={handleAddButtonPress} >
                  <AddCircleOutline />
                </IconButton>
              </Box>
            </ListItem>
          </List>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          onClick={handleDeleteButtonPress}
        >
          Delete
        </Button>
        <Button
          variant='contained'
          onClick={handleSaveButtonPress}
        >
          Save & Exit
        </Button>
      </DialogActions>
    </Dialog >
  );
};
