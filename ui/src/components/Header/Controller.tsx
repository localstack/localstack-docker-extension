import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, Button, ButtonGroup, Select, MenuItem, FormControl, Box, Badge, Tooltip } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { createStyles, makeStyles } from '@mui/styles';
import { DEFAULT_CONFIGURATION_ID, SDK_START_ARGS } from '../../constants';
import { DockerImage } from '../../types';
import { useDDClient, useRunConfig, useLocalStack, useMountPoint } from '../../services/hooks';
import { LongMenu } from './Menu';

const useStyles = makeStyles(() => createStyles({
  selectForm: {
    color: '#ffffff',
  },
}));

export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { runConfig, isLoading, createConfig } = useRunConfig();
  const { data, mutate } = useLocalStack();
  const [runningConfig, setRunningConfig] = useState<string>('Default');
  const isRunning = data && data.State === 'running';
  const { data: mountPoint } = useMountPoint();

  const classes = useStyles();

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
    } else {
      ddClient.desktopUI.toast.success('Starting LocalStack');
    }

    const corsArg = ['-e', 'EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000'];
    let isPro = false;
    const addedArgs = runConfig.find(config => config.name === runningConfig)
      .vars.map(item => {
        if (item.variable === 'EXTRA_CORS_ALLOWED_ORIGINS') {
          corsArg.slice(0, 0);
          return ['-e', `${item.variable}=${item.value},http://localhost:3000`];
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
    ddClient.docker.cli.exec('run', args).then(() => mutate());
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
                className={classes.selectForm}
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
