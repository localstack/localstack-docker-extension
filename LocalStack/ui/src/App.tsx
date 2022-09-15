import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Box, Card, TextField } from '@mui/material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [status, setStatus] = useState<string>('');
  const ddClient = useDockerDesktopClient();

  const checkStatus = async () => {
    const result = await ddClient.docker.cli.exec('run', ['--rm', '-i', '--entrypoint=', '-v', '/var/run/docker.sock:/var/run/docker.sock', 'localstack/localstack', 'bin/localstack', 'status'])
    console.log(result)
    setStatus(result.stdout ? result.stdout : result.stderr);
  }

  const start = async () => {
    ddClient.docker.cli.exec('run', ['--rm', '-i', '-e', 'LOCALSTACK_VOLUME_DIR=/tmp', '--entrypoint=', '-v', '/var/run/docker.sock:/var/run/docker.sock', 'localstack/localstack', 'bin/localstack', 'start', '-d'], {
      stream: {
        onOutput(data): void {
          console.log(data)
          if (data.stderr) {
            console.log(data.stderr)
          }
          if(data.stdout){
            setStatus(status.concat(data.stdout));
          }
          checkStatus();
        },
        onError(error: any): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error)

        },
        onClose(exitCode: number): void {
          console.log("onClose with exit code " + exitCode);
        },
      },
    });
  }


  const stop = async () => {
    ddClient.docker.cli.exec('run',
      ['--rm', '-i', '-e',
        'LOCALSTACK_VOLUME_DIR=~/.cache/localstack/volume', '--entrypoint=', '-v',
        '/var/run/docker.sock:/var/run/docker.sock', 'localstack/localstack', 'bin/localstack', 'stop'
      ]).then(_res => checkStatus());
  }


  return (
    <>
      <Box>
        <Button variant="contained" onClick={() => checkStatus()}>
          Refresh
        </Button>
        <Button variant="contained" onClick={start} style={{ margin: 10 }}>
          Start LocalStack
        </Button>
        <Button variant="contained" onClick={stop}>
          Stop LocalStack
        </Button>
      </Box>
      <Card>
        <TextField
          label="Status"
          multiline
          fullWidth
          value={status}
          variant="outlined"
        />
      </Card>
    </>
  );
}
