import { Add as AddIcon, Edit } from '@mui/icons-material';
import { Box, Button, Card, IconButton, TextField, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ReactElement, useState } from 'react';
import { useRunConfig } from '../../services/hooks';
import { UpsertConfig } from './UpsertConfig';
import { Optional, RunConfig } from '../../types';

const useStyles = makeStyles((theme: Theme) => createStyles({
  addButton: {
    margin: theme.spacing(2),
  },
}));

export const StartConfigs = (): ReactElement => {

  const { runConfig } = useRunConfig();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [targetConfig, setTargetConfig] = useState<RunConfig | null>(null);

  const classes = useStyles();

  const openModalSetup = (config?: Optional<RunConfig>) => {
    setTargetConfig(config);
    setOpenModal(true);
  };

  return (
    <Card>
      <Button
        className={classes.addButton}
        endIcon={<AddIcon />}
        variant='contained'
        onClick={() => openModalSetup()}
      >
        New
      </Button>
      {openModal && <UpsertConfig config={targetConfig} open={openModal} onClose={() => setOpenModal(false)} />}
      {
        runConfig.map(item => (
          <Box key={item.id}>
            <Box p={2} display="flex" width='full' >
              <TextField fullWidth variant="outlined" disabled value={item.name} />
              {item.id !== '0' &&
                <IconButton onClick={() => openModalSetup(item)} >
                  <Edit />
                </IconButton>
              }
            </Box>
          </Box>
        ))
      }
    </Card >
  );
};
