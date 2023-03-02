import {
  Box,
  Dialog,
  DialogContent,
  Skeleton,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { UPDATE_ARGS } from '../../../constants';
import { useDDClient } from '../../../services';

type Props = {
  open: boolean,
  onClose: () => void;
};

export const UpdateDialog = ({ open, onClose }: Props): ReactElement => {
  const [logs, setLogs] = useState<string[]>([]);
  const ddClient = useDDClient();
  const [isUpdating, setIsUpdating] = useState<boolean>(true);

  useEffect(() => {
    const listener = ddClient.docker.cli.exec('run', UPDATE_ARGS, {
      stream: {
        onOutput(data): void {
          const resultStr = data.stdout
            .replaceAll('â', '')
            .replaceAll('â', '✅')
            .replaceAll('â', '❌');

          if (resultStr.endsWith('updated')) {
            resultStr.concat(' 🔼');
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
        splitOutputLines: true,
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
                Updating docker images
              </Typography>
              <br />
            </>
          }
          {
            isUpdating &&
            <Skeleton animation="wave" />
          }
        </Box>
      </DialogContent>
    </Dialog >
  );
};
