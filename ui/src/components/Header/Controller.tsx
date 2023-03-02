import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, ButtonGroup, Select, MenuItem, FormControl, Box, Badge, Tooltip } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { isALocalStackContainer, useDDClient, useLocalStack, useMountPoint, useRunConfig } from '../../services';
import {
  DEFAULT_CONFIGURATION_ID,
  CORS_ALLOW_DEFAULT,
  LATEST_IMAGE,
  START_ARGS,
  FLAGS,
} from '../../constants';
import { LongMenu } from './Menu';
import { DockerContainer, DockerImage } from '../../types';
import { DownloadProgressDialog } from '../Feedback/DownloadProgressDialog';
import { ProgressButton } from '../Feedback';

const EXCLUDED_ERROR_TOAST = ['Successfully activated API key','Execution of "prepare_host"','DEBUG'];

export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { runConfig, isLoading, createConfig } = useRunConfig();
  const { data, mutate } = useLocalStack();
  const [runningConfig, setRunningConfig] = useState<string>('Default');
  const isRunning = data && data.State === 'running';
  const { user, os } = useMountPoint();
  const [downloadProps, setDownloadProps] = useState({ open: false, image: LATEST_IMAGE });
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);

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

  const buildMountArg = () => {
    if (ddClient.host.platform === 'win32'
      && os
      && user) {
      return ['-e', `LOCALSTACK_VOLUME_DIR=\\\\wsl$\\${os}\\home\\${user}\\.cache\\localstack\\volume`];
    }

    const OSPath = ddClient.host.platform === 'darwin'
      ? 'Users'
      : 'home';

    return ['-e', `LOCALSTACK_VOLUME_DIR=/${OSPath}/${user}/.cache/localstack/volume`];
  };

  const normalizeArguments = async () => {
    const extendedFlag = FLAGS.map(x => x); // clone

    const corsArg = ['-e', `EXTRA_CORS_ALLOWED_ORIGINS=${CORS_ALLOW_DEFAULT}`];

    const addedArgs = runConfig.find(config => config.name === runningConfig)
      .vars.map(item => {
        if (item.variable === 'EXTRA_CORS_ALLOWED_ORIGINS') { // prevent overriding variable
          corsArg.slice(0, 0);
          return ['-e', `${item.variable}=${item.value},${CORS_ALLOW_DEFAULT}`];
        }
        if (item.variable === 'DOCKER_FLAGS') {
          extendedFlag[1] = FLAGS.at(1).slice(0, -1).concat(` ${item.value}'`);
        }

        return ['-e', `${item.variable}=${item.value}`];
      }).flat();

    return [...extendedFlag, ...buildMountArg(), ...corsArg, ...addedArgs, ...START_ARGS];
  };

  const start = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];
    const haveLocally = images.some(image => image.RepoTags?.at(0) === LATEST_IMAGE);

    if (!haveLocally) {
      setDownloadProps({ open: true, image: LATEST_IMAGE });
      return;
    }
    const args = await normalizeArguments();

    setIsStarting(true);
    ddClient.docker.cli.exec('run', args, {
      stream: {
        onOutput(data): void {
          if (!EXCLUDED_ERROR_TOAST.some(item => data.stderr.includes(item))) {
            ddClient.desktopUI.toast.error(data.stderr);
            setIsStarting(false);
          }
        },
        onClose(exitCode) {
          setIsStarting(false);
          if (exitCode === 0) {
            ddClient.desktopUI.toast.success('LocalStack started');
          }
        },
      },
    });
  };

  const stop = async () => {
    setIsStopping(true);
    const containers = await ddClient.docker.listContainers({ 'all': true }) as [DockerContainer];

    const stoppedContainer = containers.find(container =>
      isALocalStackContainer(container)
      && !Object.keys(containers[0].Labels).some(key => key === 'cloud.localstack.spawner')
      && container.Command === 'docker-entrypoint.sh');

    const spawnerContainer = containers.find(container =>
      Object.keys(container.Labels).includes('cloud.localstack.spawner'));

    if (spawnerContainer) {
      await ddClient.docker.cli.exec('stop', [spawnerContainer.Id]); // stop the spawner
    }

    if (stoppedContainer) {
      if (stoppedContainer.State === 'created') { // not started
        await ddClient.docker.cli.exec('rm', [stoppedContainer.Id]); // remove it 
      } else {
        await ddClient.docker.cli.exec('stop', [stoppedContainer.Id]);
      }
    }

    setIsStopping(false);
    mutate();
  };

  const onClose = () => {
    setDownloadProps({ open: false, image: downloadProps.image });
    start();
  };

  return (
    <Box display="flex" gap={1} alignItems="center">
      <DownloadProgressDialog
        imageName={downloadProps.image}
        open={downloadProps.open}
        onClose={onClose}
      />
      <ButtonGroup variant="outlined">
        {(isRunning && !isStarting) ?
          <ProgressButton
            variant="contained"
            loading={isStopping}
            onClick={stop}
            startIcon={<Stop />}>
            Stop
          </ProgressButton>
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
              <ProgressButton
                variant="contained"
                loading={isStarting}
                onClick={start}
                startIcon={<PlayArrow />}>
                Start
              </ProgressButton>

            </Box>
          </Box>
        }
      </ButtonGroup>
      <Tooltip title={data ? tooltipLabel : ''} >
        <Badge color="error" overlap="circular" badgeContent=" " variant="dot" invisible={!isUnhealthy}>
          <Chip
            label={(isRunning && !isStarting) ? 'Running' : 'Stopped'}
            color={(isRunning && !isStarting) ? 'success' : 'warning'}
            sx={{ p: 2, borderRadius: 4 }}
          />
        </Badge>
      </Tooltip>
      <LongMenu />
    </Box>
  );
};
