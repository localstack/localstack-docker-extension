import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, Button, ButtonGroup, Select, MenuItem, FormControl, Box, Badge, Tooltip } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useDDClient, useLocalStack, useMountPoint, useRunConfig } from '../../services';
import { DEFAULT_CONFIGURATION_ID, CORS_ALLOW_DEFAULT, SDK_START_ARGS } from '../../constants';
import { LongMenu } from './Menu';
import { DockerImage } from '../../types';

export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { runConfig, isLoading, createConfig } = useRunConfig();
  const { data, mutate } = useLocalStack();
  const [runningConfig, setRunningConfig] = useState<string>('Default');
  const isRunning = data && data.State === 'running';
  const { data: mountPoint } = useMountPoint();

  const isUnhealthy = data && data.Status.includes('unhealthy');
  const tooltipLabel = isUnhealthy ? 'Unhealthy' : 'Healthy';

  useEffect(() => {
    if (!isLoading && (!runConfig || !runConfig.find(item => item.name === 'Default'))) {
      createConfig({
        name: 'Default', id: DEFAULT_CONFIGURATION_ID, vars: [],
      },
      );
    }
  }, [isLoading]);

  const normalizeArguments = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];

    if (!images.some(image => image.RepoTags?.at(0) === 'localstack/localstack:latest')) {
      ddClient.desktopUI.toast.warning('localstack/localstack:latest not found; now pulling..');
    } 

    const corsArg = ['-e', `EXTRA_CORS_ALLOWED_ORIGINS=${CORS_ALLOW_DEFAULT}`];
    let isPro = false;
    const addedArgs = runConfig.find(config => config.name === runningConfig)
      .vars.map(item => {
        if (item.variable === 'EXTRA_CORS_ALLOWED_ORIGINS') {
          corsArg.slice(0, 0);
          return ['-e', `${item.variable}=${item.value},${CORS_ALLOW_DEFAULT}`];
        }
        if (item.variable === 'LOCALSTACK_API_KEY') {
          isPro = true;
        }
        return ['-e', `${item.variable}=${item.value}`];
      }).flat();

    const standardDir = `${ddClient.host.platform === 'darwin' ? 'Users' : 'home'}/${mountPoint}`;
    const mountArg = ['-e', `/${mountPoint === 'tmp' ? `${mountPoint}` :
      `${standardDir}/.cache`}/localstack/volume:/var/lib/localstack`];

    return [...SDK_START_ARGS, ...mountArg, ...corsArg, ...addedArgs, `localstack/localstack${isPro ? '-pro' : ''}`];
  };

  const start = async () => {
    const args = await normalizeArguments();
    ddClient.docker.cli.exec('run', args,{
      stream: {
        onOutput(data): void {
          if(data.stderr){
            ddClient.desktopUI.toast.error(data.stderr);
          }
        },
        onClose(exitCode) {
          if(exitCode === 0){
            ddClient.desktopUI.toast.success('Starting LocalStack');
          }
        },
      },
    });
  };

  const stop = async () => {
    ddClient.docker.cli.exec('stop', ['localstack_main']).then(() => mutate());
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
      <Tooltip title={data ? tooltipLabel : ''} >
        <Badge color="error" overlap="circular" badgeContent=" " variant="dot" invisible={!isUnhealthy}>
          <Chip
            label={isRunning ? 'Running' : 'Stopped'}
            color={isRunning ? 'success' : 'warning'}
            sx={{ p: 2, borderRadius: 4 }}
          />
        </Badge>
      </Tooltip>
      <LongMenu />
    </Box>
  );
};
