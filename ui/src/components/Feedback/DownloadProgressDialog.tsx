import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { DownloadProgress } from './DownloadProgress';

interface DownloadProgressDialogProps {
  imageName: string;
  open: boolean;
  onClose: () => void;
}

export const DownloadProgressDialog = ({ imageName, open, onClose }: DownloadProgressDialogProps): ReactElement => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <Box display='flex' gap={5} alignItems="center">
        <Typography>
          Pulling {imageName}
        </Typography>
        <DownloadProgress
          imageName={imageName}
          callback={onClose}
        />
      </Box>
    </DialogContent>
  </Dialog >
);
