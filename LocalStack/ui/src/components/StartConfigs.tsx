import { AddCircleOutline } from "@mui/icons-material";
import { Box, Card, IconButton, TextField, Theme } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { v4 as uuid } from 'uuid';
import { useRunConfig } from "../service/hooks";
import { StartConfig } from "./StartConfig";
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    margin: theme.spacing(2),
  },
}));

export const StartConfigs = (): ReactElement => {

  const { runConfig, setRunConfig } = useRunConfig();
  const [newConfigName, setNewConfigName] = useState<string>('');

  const classes = useStyles();

  const handleAddButtonPress = () => {
    setRunConfig([...runConfig, { name: newConfigName, id: uuid(), vars: [] }]);
    setNewConfigName('');
  };

  return (
    <Card className={classes.root}>
      {runConfig.map(item => (
        <Box key={item.id}>
          <StartConfig id={item.id} />
        </Box>
      ))}
      <Box p={2} display="flex" width='full'>
        <TextField
          fullWidth
          variant="outlined"
          label='Name'
          onChange={(e) => setNewConfigName(e.target.value)}
          value={newConfigName}
        />
        <IconButton onClick={handleAddButtonPress} >
          <AddCircleOutline />
        </IconButton>
      </Box>

    </Card>
  );
};
