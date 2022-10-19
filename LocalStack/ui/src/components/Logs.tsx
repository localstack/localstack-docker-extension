import { Card, TextField } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient, useLocalStack } from '../service/hooks';

export const Logs = (): ReactElement => {
  const [logs, setLogs] = useState<string[]>([]);
  const ddClient = useDDClient();
  const { data } = useLocalStack();

  const checkLogs = async () => {
    if (data) {
      ddClient.docker.cli.exec('logs', ['-f', data.Id], {
        stream: {
          onOutput(data): void {
            setLogs([...logs, data.stdout]);
          },
          onError(error: unknown): void {
            ddClient.desktopUI.toast.error('An error occurred');
            console.log(error);
          },
          splitOutputLines: true,
        },
      });
    }
  };

  useEffect(() => {
    checkLogs();
  }, [data]);

  return (
    <Card>
      <TextField
        multiline
        fullWidth
        value={logs.join('\n')}
        variant="outlined"
      />
    </Card>
  );
};
