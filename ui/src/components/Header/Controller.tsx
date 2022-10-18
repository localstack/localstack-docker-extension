import React, { ReactElement, useEffect, useState } from 'react';
import { Chip, Button, ButtonGroup, Select, MenuItem, FormControl } from '@mui/material';
import { START_ARGS, STOP_ARGS } from '../../constants';
import { DockerImage } from '../../types';
import { useDDClient, useRunConfig, useLocalStack } from '../../service/hooks';
import { PlayArrow, Stop } from '@mui/icons-material';
import { v4 as uuid } from 'uuid';


export const Controller = (): ReactElement => {
  const ddClient = useDDClient();
  const { runConfig, setRunConfig } = useRunConfig();
  const { data, mutate } = useLocalStack();
  const [runningConfig, setRunningConfig] = useState<string>('Default');
  const isRunning = data && data.State === 'running';

  useEffect(() => {
    if (!runConfig.find(item => item.name === 'Default')) {
      setRunConfig([...runConfig,
        {
          name: 'Default', id: '0', vars:
          [{ variable: 'EXTRA_CORS_ALLOWED_ORIGINS', value: 'http://localhost:3000', id: uuid() }],
        },
      ]);
    }
  });


  const start = async () => {
    const images = await ddClient.docker.listImages() as [DockerImage];
    if (!images.some(image => image.RepoTags?.at(0) === 'localstack/localstack:latest')) {
      ddClient.desktopUI.toast.warning('localstack/localstack:latest not found; now pulling..');
    }
    const addedArgs = runConfig.find(x => x.name === runningConfig)
      .vars.map(item => ['-e', `${item.variable}=${item.value}`]).flat();
    ddClient.docker.cli.exec('run', addedArgs.concat(START_ARGS), {
      stream: {
        onOutput(data) {
          if (data.stdout) {
            console.error(data.stdout);
          } else {
            console.log(data.stderr);
          }
        },
        onError(error) {
          console.error(error);
        },
        onClose(exitCode) {
          console.log("onClose with exit code " + exitCode);
        },
      },
    }); //.then(() => mutate());
  };

  const stop = async () => {
    ddClient.docker.cli.exec('run', STOP_ARGS).then(() => mutate());
  };


  return (
    <>
      <Chip
        style={{ borderRadius: 20 }}
        label={isRunning ? 'Running' : 'Stopped'}
        color={isRunning ? 'success' : 'error'}

      />
      <ButtonGroup variant="outlined">
        <Button
          variant="contained"
          onClick={start}
          endIcon={<PlayArrow />}>
          Start
        </Button>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            value={runningConfig}
            onChange={({ target }) => setRunningConfig(target.value)}
          >
            {
              runConfig.map(config => (
                <MenuItem key={config.id} value={config.name}>{config.name}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={stop}
          endIcon={<Stop />}>
          Stop
        </Button>
      </ButtonGroup>
    </>
  );
};
