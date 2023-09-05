import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
  Theme,
} from '@mui/material';
import { Add, Remove, Settings } from '@mui/icons-material';
import React, { ReactElement, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createStyles, makeStyles } from '@mui/styles';
import { useRunConfigs } from '../../../services/hooks';
import { RunConfig } from '../../../types';

const DEFAULT_COLUMN_WIDTH = 2000;

const COMMON_CONFIGURATIONS = [
  ['DEBUG', '0', 'Flag to increase log level and print more verbose logs'],
  ['PERSISTENCE', '0', 'Enable persistence'],
  ['LOCALSTACK_API_KEY', '', 'API key to activate LocalStack Pro.'],
];

type Props = {
  config?: RunConfig,
  open: boolean,
  onClose: () => void;
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  emptyBox: {
    height: theme.spacing(5),
  },
  textField: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

export const UpsertConfig = ({ config, open, onClose }: Props): ReactElement => {

  const { updateConfig } = useRunConfigs();
  const [newVar, setNewVar] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [configName, setConfigName] = useState<string>(config?.name || '');
  const [newConfig, setNewConfig] = useState<RunConfig>(config ||
    {
      name: '',
      id: uuid(),
      vars: COMMON_CONFIGURATIONS.map(
        ([variable, value, description]) => ({ variable, value, id: uuid(), description }),
      ),
    } as RunConfig);
  const classes = useStyles();

  const handleAddButtonPress = () => {
    setNewConfig({
      name: newConfig.name, id: newConfig.id || uuid(), vars: [...newConfig.vars,
        { variable: newVar, value: newValue, id: uuid() }],
    });
    setNewVar('');
    setNewValue('');
  };

  const handleSaveButtonPress = () => {
    updateConfig({
      name: configName, id: newConfig.id, vars:
        newVar && newValue ? [...newConfig.vars, { variable: newVar, value: newValue, id: uuid() }] : newConfig.vars,
    });
    onClose();
  };

  const handleRemoveButtonPress = (id: string) => {
    setNewConfig({
      name: newConfig.name, id: newConfig.id || uuid(), vars: newConfig.vars?.filter(item => item?.id !== id) || [],
    });
  };

  const updateConfigKey = (id: string, key: string) => {
    setNewConfig({
      ...newConfig, vars: newConfig.vars.map(envVar => {
        if (envVar.id === id) {
          const updatedVar = envVar;
          updatedVar.variable = key;
          return updatedVar;
        }
        return envVar;
      }),
    });
  };

  const updateConfigValue = (id: string, value: string) => {
    setNewConfig({
      ...newConfig, vars: newConfig.vars.map(envVar => {
        if (envVar.id === id) {
          const updatedVar = envVar;
          updatedVar.value = value;
          return updatedVar;
        }
        return envVar;
      }),
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box display='flex' width='full' flexDirection='column'>
          <Settings fontSize='large' />
          <Box className={classes.emptyBox} />
          <TextField
            fullWidth
            variant='outlined'
            label='Configuration Name'
            value={configName}
            required
            onChange={(e) => setConfigName(e.target.value)}
          />
        </Box>
        <Box className={classes.emptyBox} />
        <List
          subheader={
            <Typography>Environment Variables</Typography>
          }
        >
          {newConfig?.vars.map(item => (
            <ListItem key={item.id} disableGutters>
              <Box width={DEFAULT_COLUMN_WIDTH}>
                <Box display='flex' key={item.id}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    className={classes.textField}
                    onChange={(e) => updateConfigKey(item.id, e.target.value.toLocaleUpperCase())}
                    value={item.variable}
                  />
                  <TextField
                    fullWidth
                    variant='outlined'
                    label='Value'
                    className={classes.textField}
                    onChange={(e) => updateConfigValue(item.id, e.target.value)}
                    value={item.value} />
                  <IconButton onClick={() => handleRemoveButtonPress(item.id)} >
                    <Remove />
                  </IconButton>
                </Box>
                {item.description &&
                  <Typography variant='caption'>{item.description}</Typography>
                }
              </Box>
            </ListItem>
          ))}
          <ListItem key='addItem' disableGutters>
            <Box display='flex' width={DEFAULT_COLUMN_WIDTH} key='addItem' >
              <TextField
                fullWidth
                variant='outlined'
                label='Variable'
                onChange={(e) => setNewVar(e.target.value.toLocaleUpperCase())}
                className={classes.textField}
                value={newVar}
              />

              <TextField
                fullWidth
                variant='outlined'
                label='Value'
                onChange={(e) => setNewValue(e.target.value)}
                className={classes.textField}
                value={newValue}
              />
              <IconButton onClick={handleAddButtonPress} >
                <Add />
              </IconButton>
            </Box>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          variant='outlined'
          color='error'
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSaveButtonPress}
          disabled={!configName}
        >
          Save & Exit
        </Button>
      </DialogActions>
    </Dialog >
  );
};
