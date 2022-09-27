import React, { useEffect, useState } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Accordion, AccordionSummary, Box, Card, Chip, TextField, Typography, Button, IconButton } from '@mui/material';
import { START_ARGS, STATUS_ARGS, STOP_ARGS } from './constants';
import { useLocalStackHealth, useEnvVars } from './hooks';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { DockerImage } from './types';
import { StartOptions } from './views';

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [status, setStatus] = useState<string>('');
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const ddClient = useDockerDesktopClient();
  const { envVars } = useEnvVars();

  const { health, mutate } = useLocalStackHealth();

  const checkStatus = async () => {
    const result = await ddClient.docker.cli.exec('run', STATUS_ARGS);
    mutate();
    setStatus(status.concat(result.stdout ? result.stdout : result.stderr));
  };

  useEffect(() => {
    checkStatus();
  }, [health]);

  const start = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];
    if (!images.some(image => image.RepoTags?.at(0) === 'localstack/localstack:latest')) {
      ddClient.desktopUI.toast.warning('localstack/localstack:latest not found; now pulling..');
    }

    const addedArgs = envVars.map(item => ['-e', `${item.variable}=${item.value}`]).flat();
    ddClient.docker.cli.exec('run', addedArgs.concat(START_ARGS), {
      stream: {
        onOutput(data): void {
          setStatus(status.concat(data.stdout || data.stderr || ''));
          checkStatus();
        },
        onError(error: unknown): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error);

        },
      },
    });
  };

  const stop = async () => {
    // eslint-disable-next-line no-unused-vars
    ddClient.docker.cli.exec('run', STOP_ARGS).then(_res => checkStatus());
  };


  return (
    <>
      <Box mt={2} display="flex" alignItems="center">
        <Chip
          label={health ? 'Running' : 'Stopped'}
          color={health ? 'success' : 'error'}
        />
        <Box style={{ margin: 10 }} bgcolor="primary">
          <Button variant="contained" onClick={start} >
            Start LocalStack
          </Button>
          <IconButton color="primary" onClick={() => setShowStartModal(true)}>
            <ExpandMoreIcon />
          </IconButton>
          <StartOptions
            open={showStartModal}
            onClose={() => setShowStartModal(false)}
          />
        </Box>
        <Button variant="contained" onClick={stop}>
          Stop LocalStack
        </Button>
      </Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>Show Log Output</Typography>
        </AccordionSummary>
        <Card>
          <TextField
            multiline
            fullWidth
            value={status}
            variant="outlined"
          />
        </Card>
      </Accordion>
    </>
  );
}
