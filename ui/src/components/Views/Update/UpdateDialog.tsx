import {
  Box,
  Dialog,
  DialogContent,
  Skeleton,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient } from '../../../services';
import { generateCLIArgs } from '../../../services/util/cli';

type Props = {
  open: boolean,
  onClose: () => void;
};

export const UpdateDialog = ({ open, onClose }: Props): ReactElement => {
  const [logs, setLogs] = useState<string[]>([]);
  const { client: ddClient } = useDDClient();
  const [isUpdating, setIsUpdating] = useState<boolean>(true);

  useEffect(() => {
    const listener = ddClient.docker.cli.exec('run', generateCLIArgs({ call: 'update' }), {
      stream: {
        onOutput(data): void {
          let resultStr = data.stdout
            .replaceAll('â', '')
            .replaceAll('â', '✅')
            .replaceAll('â', '❌');

          if (data.stdout.includes('Updating docker images')) {
            resultStr = 'Updating Docker images';
          }

          if (resultStr.endsWith('updated.')) {
            resultStr = resultStr.concat(' 🔼');
          }
          setLogs((current) => [...current, resultStr]);
        },
        onError(error: unknown): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error);
        },
        onClose(exitCode) {
          setIsUpdating(false);
          console.log(`onClose with exit code ${exitCode}`);
        },
      },
    });

    return () => {
      listener.close();
      setLogs([]);
    };

  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box m={2} width={500} height={400}>
          {
            logs.map(log => (
              <>
                <Typography>
                  {log}
                </Typography>
                <br />
              </>
            ))
          }
          {
            logs.length === 0 &&
            <>
              <Typography>
                Updating Docker images
              </Typography>
              <br />
            </>
          }
          {
            isUpdating &&
            <Skeleton animation='wave' />
          }
        </Box>
      </DialogContent>
    </Dialog >
  );
};
