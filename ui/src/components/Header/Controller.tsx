import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, ButtonGroup, Select, MenuItem, FormControl, Box, Badge, Tooltip } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import {
  isALocalStackContainer,
  removeTagFromImage,
  useDDClient,
  useLocalStack,
  useMountPoint,
  useRunConfigs,
} from '../../services';
import {
  DEFAULT_CONFIGURATION_ID,
  FLAGS,
  PRO_IMAGE,
  COMMUNITY_IMAGE,
} from '../../constants';
import { LongMenu } from './Menu';
import { DockerContainer, DockerImage } from '../../types';
import { DownloadProgressDialog } from '../Feedback/DownloadProgressDialog';
import { ProgressButton } from '../Feedback';
// import { generateCLIArgs } from '../../services/util/cli';

const EXCLUDED_ERROR_TOAST = ['INFO', 'WARN', 'DEBUG'];

export const Controller = (): ReactElement => {
  const { configData, isLoading, setRunningConfig: setBackendRunningConfig, createConfig } = useRunConfigs();
  const { data, mutate } = useLocalStack();
  const { user, os, hasSkippedConfiguration } = useMountPoint();
  const [runningConfig, setRunningConfig] = useState<string>(configData.runningConfig ?? DEFAULT_CONFIGURATION_ID);
  const [downloadProps, setDownloadProps] = useState({ open: false, image: COMMUNITY_IMAGE });
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const ddClient = useDDClient();
  const isRunning = data && data.State === 'running';
  const isUnhealthy = data && data.Status.includes('unhealthy');
  const tooltipLabel = isUnhealthy ? 'Unhealthy' : 'Healthy';

  useEffect(() => {
    if (!isLoading &&
      (!configData?.configs || !configData.configs?.find(item => item.id === DEFAULT_CONFIGURATION_ID))) {
      createConfig({
        name: 'Default', id: DEFAULT_CONFIGURATION_ID, vars: [],
      });
    }
    if (!isLoading) {
      setRunningConfig(configData.runningConfig ?? DEFAULT_CONFIGURATION_ID);
    }
  }, [isLoading]);

  const buildHostArgs = () => {
    let location = 'LOCALSTACK_VOLUME_DIR=/tmp/localstack/volume';
    // let homeDir = `HOME=/home/${user}`;

    if (!hasSkippedConfiguration) {
      switch (ddClient.host.platform) {
        case 'win32':
          location = `LOCALSTACK_VOLUME_DIR=\\\\wsl$\\${os}\\home\\${user}\\.cache\\localstack\\volume`;
          // homeDir = `HOME=\\\\wsl$\\${os}\\home\\${user}`;
          break;
        case 'darwin':
          location = `LOCALSTACK_VOLUME_DIR=/Users/${user}/Library/Caches/localstack/volume`;
          // homeDir = `HOME=/Users/${user}`;
          break;
        default:
          location = `LOCALSTACK_VOLUME_DIR=/home/${user}/.cache/localstack/volume`;
        // homeDir = `HOME=/home/${user}`;
      }
    }
    return ['-e', location];
  };

  const normalizeArguments = async () => {
    const extendedFlag = FLAGS.map(x => x); // clone
    const addedArgs = configData.configs.find(config => config.id === runningConfig)
      .vars.map(item => {
        if (item.variable === 'DOCKER_FLAGS') {
          extendedFlag[1] = FLAGS.at(1).slice(0, -1).concat(` ${item.value}'`);
        }

        return ['-e', `${item.variable}=${item.value}`];
      }).flat();

    return [
      ...extendedFlag,
      ...buildHostArgs(),
      ...addedArgs,
    ];
  };

  const getBinary = async () => {
    let architecture = '';
    if (ddClient.host.arch === 'x64') {
      architecture = 'amd';
    } else if (ddClient.host.arch === 'arm64') {
      architecture = 'arm';
    } else {
      ddClient.desktopUI.toast.error(`Extension does not support ${ddClient.host.arch} architecture`);
      return null;
    }

    let os = '';
    if (ddClient.host.platform === 'darwin' || ddClient.host.platform === 'linux') {
      os = ddClient.host.platform;
    } else if (ddClient.host.platform === 'win32' && architecture === 'amd') {
      os = 'windows';
    } else {
      ddClient.desktopUI.toast.error(
        `Extension does not support ${ddClient.host.platform} operating system platform (${architecture})`,
      );
      return null;
    }

    const fullName = `localstack-${os}-${os === 'windows' ? `${architecture}.exe` : architecture}`;
    return fullName;
  };

  const start = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];

    const isPro = configData.configs.find(config => config.id === runningConfig)
      .vars.some(item => (item.variable === 'LOCALSTACK_API_KEY' ||
        item.variable === 'LOCALSTACK_AUTH_TOKEN') && item.value);

    const havePro = images.some(image => removeTagFromImage(image) === PRO_IMAGE);
    if (!havePro && isPro) {
      setDownloadProps({ open: true, image: PRO_IMAGE });
      return;
    }

    const haveCommunity = images.some(image => removeTagFromImage(image) === COMMUNITY_IMAGE);
    if (!haveCommunity) {
      setDownloadProps({ open: true, image: COMMUNITY_IMAGE });
      return;
    }

    const args = await normalizeArguments();

    setIsStarting(true);
    const binary = await getBinary();
    if (!binary) {
      return;
    }

    const res = ddClient.extension.host?.cli.exec(binary, ['start', ...args], {
      stream: {
        onOutput(data): void {
          console.log(data);
          const shouldDisplayError = !EXCLUDED_ERROR_TOAST.some(item => data.stderr?.includes(item)) && data.stderr;
          if (shouldDisplayError) {
            ddClient.desktopUI.toast.error(data.stderr);
            setIsStarting(false);
          }
        },
        onClose(exitCode) {
          console.log(exitCode);
          setIsStarting(false);
          if (exitCode === 0) {
            ddClient.desktopUI.toast.success('LocalStack started');
          }
        },
      },
    });
    console.log(res);
    setIsStarting(false);

    // ddClient.docker.cli.exec('run', args, {
    //   stream: {
    //     onOutput(data): void {
    //       const shouldDisplayError = !EXCLUDED_ERROR_TOAST.some(item => data.stderr?.includes(item)) && data.stderr;
    //       if (shouldDisplayError) {
    //         ddClient.desktopUI.toast.error(data.stderr);
    //         setIsStarting(false);
    //       }
    //     },
    //     onClose(exitCode) {
    //       setIsStarting(false);
    //       if (exitCode === 0) {
    //         ddClient.desktopUI.toast.success('LocalStack started');
    //       }
    //     },
    //   },
    // });
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
    <Box display='flex' gap={1} alignItems='center'>
      <DownloadProgressDialog
        imageName={downloadProps.image}
        open={downloadProps.open}
        onClose={onClose}
      />
      <ButtonGroup variant='outlined'>
        {(isRunning && !isStarting) ?
          <ProgressButton
            variant='contained'
            loading={isStopping}
            onClick={stop}
            startIcon={<Stop />}>
            Stop
          </ProgressButton>
          :
          <Box display='flex' alignItems='center'>
            <FormControl sx={{ m: 1, minWidth: 120, border: 'none' }} size='small'>
              <Select
                value={runningConfig}
                onChange={({ target }) => setBackendRunningConfig(target.value)}
              >
                {
                  configData?.configs?.map(config => (
                    <MenuItem key={config.id} value={config.id}>{config.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <Box>
              <ProgressButton
                variant='contained'
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
        <Badge color='error' overlap='circular' badgeContent=' ' variant='dot' invisible={!isUnhealthy}>
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
