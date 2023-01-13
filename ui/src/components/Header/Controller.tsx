import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, Button, ButtonGroup, Select, MenuItem, FormControl, Box } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { CORS_ALLOW_DEFAULT, DEFAULT_CONFIGURATION_ID, LATEST_IMAGE, START_ARGS, STOP_ARGS } from '../../constants';
import { useDDClient, useRunConfig, useLocalStack, useMountPoint } from '../../services/hooks';
import { LongMenu } from './Menu';
import { checkLocalImage } from '../../services/generic/utils';

export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { runConfig, isLoading, createConfig } = useRunConfig();
  const { data, mutate } = useLocalStack();
  const [runningConfig, setRunningConfig] = useState<string>('Default');
  const isRunning = data && data.State === 'running';
  const { data: mountPoint } = useMountPoint();

  useEffect(() => {
    if (!isLoading && (!runConfig || !runConfig.find(item => item.name === 'Default'))) {
      createConfig({
        name: 'Default', id: DEFAULT_CONFIGURATION_ID, vars: [],
      },
      );
    }
  }, [isLoading]);

  const checkForLocalImage = async () => {
    const hasImage = await checkLocalImage();
    if (!hasImage) {
      ddClient.desktopUI.toast.warning(`${LATEST_IMAGE} not found; now pulling..`);
    } else {
      ddClient.desktopUI.toast.success('Starting LocalStack');
    }
  };

  const start = async () => {
    await checkForLocalImage();

    const standardDir = `${ddClient.host.platform === 'darwin' ? 'Users' : 'home'}/${mountPoint}`;
    const mountArg = `-e LOCALSTACK_VOLUME_DIR=/${mountPoint === 'tmp' ? mountPoint : standardDir}/.localstack-volume`;
    const corsArg = ['-e',`EXTRA_CORS_ALLOWED_ORIGINS=${CORS_ALLOW_DEFAULT}`];

    const addedArgs = runConfig.find(config => config.name === runningConfig)
      .vars.map(item => {
        if (item.variable === 'EXTRA_CORS_ALLOWED_ORIGINS') {
          corsArg.slice(0, 0);
          return ['-e', `${item.variable}=${item.value},${CORS_ALLOW_DEFAULT}`];
        }
        return ['-e', `${item.variable}=${item.value}`];
      }).flat();

    ddClient.docker.cli.exec('run', [mountArg, ...corsArg, ...addedArgs, ...START_ARGS]).then(() => mutate());
  };

  const stop = async () => {
    ddClient.docker.cli.exec('run', STOP_ARGS).then(() => mutate());
  };

  return (
    <Box display="flex" gap={1} alignItems="center">
      <ButtonGroup variant="outlined">
        {isRunning ?
          <Button
            variant="contained"
            onClick={stop}
            startIcon={<Stop />}>
            Stop
          </Button>
          :
          <Box display="flex" alignItems="center">
            <FormControl sx={{ m: 1, minWidth: 120, border: 'none' }} size="small">
              <Select
                value={runningConfig}
                onChange={({ target }) => setRunningConfig(target.value)}
              >
                {
                  runConfig?.map(config => (
                    <MenuItem key={config.id} value={config.name}>{config.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <Box>
              <Button
                variant="contained"
                onClick={start}
                startIcon={<PlayArrow />}>
                Start
              </Button>

            </Box>
          </Box>
        }
      </ButtonGroup>
      <Chip
        label={isRunning ? 'Running' : 'Stopped'}
        color={isRunning ? 'success' : 'warning'}
        sx={{ p: 2, borderRadius: 10 }}
      />
      <LongMenu />
    </Box>
  );
};
