import { Box, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient, useLocalStack } from '../../services/hooks';

export const Logs = (): ReactElement => {
  const [logs, setLogs] = useState<string[]>([]);
  const ddClient = useDDClient();
  const { data } = useLocalStack();

  useEffect(() => {
    if (data) {
      const listener = ddClient.docker.cli.exec('logs', ['-f', data.Id], {
        stream: {
          onOutput(data): void {
            setLogs((current) => [...current, data.stdout]);
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
    <>
      {!data &&
        <Box my={10}>
          <Typography variant='h2' style={{ textAlign: 'center' }}>
            No instance is running - Start LocalStack to see it&apos;s logs
          </Typography>
        </Box>
      }
      <Box m={2}>
        {logs.map(log => (
          <>
            <Typography>
              {`${log}`}
            </Typography>
            <br />
          </>
        ))}
      </Box>
    </>
  );
};
