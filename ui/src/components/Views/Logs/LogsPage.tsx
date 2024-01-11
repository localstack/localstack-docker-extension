import { Box, Card, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient, useLocalStack } from '../../../services';

export const LogsPage = (): ReactElement => {
  const [logs, setLogs] = useState<string[]>([]);
  const { client: ddClient } = useDDClient();
  const { data } = useLocalStack();
  
  useEffect(() => {
    if (data) {
      const listener = ddClient.docker.cli.exec('logs', ['-f', data.Id], {
        stream: {
          onOutput(data): void {
            setLogs((current) => [...current, data.stdout ? data.stdout : data.stderr]);
          },
          onError(error: unknown): void {
            ddClient.desktopUI.toast.error('An error occurred');
            console.log(error);
          },
          onClose(exitCode) {
            console.log(`onClose with exit code ${exitCode}`);
          },
          splitOutputLines: true,
        },
      });

      return () => {
        listener.close();
        setLogs([]);
      };
    }
  }, [data]);

  
  return (
    !data ?
      <Box my={10}>
        <Typography variant='h2' style={{ textAlign: 'center' }}>
          No instance is running - Start LocalStack to see its logs
        </Typography>
      </Box>
      :
      <Card style={{ padding: 20, pointerEvents: 'none' }}>
        {logs.map(log => (
          <>
            <Typography>
              {log}
            </Typography>
            <br />
          </>
        ))}
      </Card>
      
  );
};
