import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, Box, Card, Chip, TextField, Typography, Button, IconButton } from '@mui/material';
import { START_ARGS, STOP_ARGS } from './constants';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { DockerImage } from './types';
import { useDDClient, useEnvVars, useLocalStack } from './service/hooks';
import { StartOptions } from './components';

export function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const ddClient = useDDClient();
  const { envVars } = useEnvVars();
  const { data, mutate } = useLocalStack();

  const isRunning = data && data.State === 'running';

  const checkLogs = async () => {
    if (data) {
      ddClient.docker.cli.exec('logs', ['-f', data.Id], {
        stream: {
          onOutput(data): void {
            console.log(data);
            setLogs([...logs,data.stdout]);
          },
          onError(error: unknown): void {
            ddClient.desktopUI.toast.error('An error occurred');
            console.log(error);

          },
          onClose(exitCode) {
            console.log("onClose with exit code " + exitCode);
          },
          splitOutputLines: true,
        },
      });
    }
  };

  useEffect(() => {
    checkLogs();
  }, [data]);

  const start = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];
    if (!images.some(image => image.RepoTags?.at(0) === 'localstack/localstack:latest')) {
      ddClient.desktopUI.toast.warning('localstack/localstack:latest not found; now pulling..');
    }
    const addedArgs = envVars.map(item => ['-e', `${item.variable}=${item.value}`]).flat();
    ddClient.docker.cli.exec('run', addedArgs.concat(START_ARGS)).then(() => mutate());
  };

  const stop = async () => {
    ddClient.docker.cli.exec('run', STOP_ARGS).then(() => mutate());
  };


  return (
    <>
      <Box mt={2} display="flex" alignItems="center">
        <Chip
          label={isRunning ? 'Running' : 'Stopped'}
          color={isRunning ? 'success' : 'error'}
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
            value={logs.join('\n')}
            variant="outlined"
          />
        </Card>
      </Accordion>
    </>
  );
}
