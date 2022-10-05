import React, { ReactElement } from 'react';
import { Box, Chip, Button } from '@mui/material';
import { START_ARGS, STOP_ARGS } from '../constants';
import { DockerImage } from '../types';
import { useDDClient, useEnvVars, useLocalStack } from '../service/hooks';
import { SystemStatus } from './SystemStatus';

export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { envVars } = useEnvVars();
  const { data, mutate } = useLocalStack();

  const isRunning = data && data.State === 'running';

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
      <Box style={{ padding: 10 }}>
        <Box mt={5} display="flex" alignItems="center">
          <Box style={{ margin: 2 }}>
            <Chip
              label={isRunning ? 'Running' : 'Stopped'}
              color={isRunning ? 'success' : 'error'}
            />
            <Button variant="contained" onClick={start} style={{ margin: 5 }}>
              Start LocalStack
            </Button>
            <Button variant="contained" onClick={stop}>
              Stop LocalStack
            </Button>
          </Box>
        </Box>
        {
          isRunning &&
          <Box >
            <SystemStatus />
          </Box>
        }
      </Box>
    </>
  );
};
