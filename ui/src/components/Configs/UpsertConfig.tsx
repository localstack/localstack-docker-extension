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
import { useRunConfig } from '../../services/hooks';
import { RunConfig } from '../../types';

const DEFAULT_COLUMN_WIDTH = 2000;

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

  const { updateConfig, deleteConfig } = useRunConfig();
  const [newVar, setNewVar] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [configName, setConfigName] = useState<string>(config?.name || '');
  const [newConfig, setNewConfig] = useState<RunConfig>(config || { name: '', id: uuid(), vars: [] } as RunConfig);
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
    updateConfig({ name: configName, id: newConfig.id, vars: newConfig.vars });
    onClose();
  };

  const handleRemoveButtonPress = (id: string) => {
    setNewConfig({
      name: newConfig.name, id: newConfig.id || uuid(), vars: newConfig.vars?.filter(item => item?.id !== id) || [],
    });
  };

  const handleDeleteButtonPress = () => {
    if (newConfig.id) {
      deleteConfig(newConfig.id);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box display="flex" width='full' flexDirection="column">
          <Settings fontSize='large' />
          <Box className={classes.emptyBox} />
          <TextField
            fullWidth
            variant="outlined"
            label='Configuration Name'
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
          />
        </Box>
        <Box className={classes.emptyBox} />
        <List
          subheader={
            <Typography>Environment Variables </Typography>
          }
        >
          {newConfig?.vars.map(item => (
            <ListItem key={item.id} disableGutters>
              <Box display="flex" width={DEFAULT_COLUMN_WIDTH} key={item.id}>
                <TextField fullWidth variant="outlined" className={classes.textField} disabled value={item.variable} />
                <TextField fullWidth variant="outlined" className={classes.textField} disabled value={item.value} />
                <IconButton onClick={() => handleRemoveButtonPress(item.id)} >
                  <Remove />
                </IconButton>
              </Box>
            </ListItem>
          ))}
          <ListItem key='addItem' disableGutters>
            <Box display="flex" width={DEFAULT_COLUMN_WIDTH} key='addItem' >
              <TextField
                fullWidth
                variant="outlined"
                label='Variable'
                onChange={(e) => setNewVar(e.target.value)}
                className={classes.textField}
                value={newVar}
              />

              <TextField
                fullWidth
                variant="outlined"
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
          variant='contained'
          color='error'
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
