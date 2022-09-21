import React, { useEffect, useState } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Accordion, AccordionSummary, Box, Card, Chip, TextField, Typography, Button } from '@mui/material';
import { START_ARGS, STATUS_ARGS, STOP_ARGS } from './constants';
import { useLocalStackHealth } from './hooks';
import {ExpandMore as ExpandMoreIcon} from '@mui/icons-material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [status, setStatus] = useState<string>('');
  const ddClient = useDockerDesktopClient();

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
    ddClient.docker.cli.exec('run', START_ARGS, {
      stream: {
        onOutput(data): void {
          console.log(data);
          if (data.stderr) {
            console.log(data.stderr);
          }
          if (data.stdout) {
            console.log(data.stdout);
            setStatus(status.concat(data.stdout));
          }
          checkStatus();
        },
        onError(error: unknown): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error);

        },
        onClose(exitCode: number): void {
          console.log("onClose with exit code " + exitCode);
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
      <Box>
        <Chip
          label={health ? 'Running' : 'Stopped'}
          color={health ? 'success' : 'error'}
        />
        <Button variant="contained" onClick={start} style={{ margin: 10 }}>
          Start LocalStack
        </Button>
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
            label="Status"
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
