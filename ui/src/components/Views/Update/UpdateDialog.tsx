import {
  Box,
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';
import React, { ReactElement } from 'react';
import { DownloadProgress } from '../../Feedback';

type Props = {
  open: boolean,
  images: string[],
  onClose: () => void;
};

export const UpdateDialog = ({ open, onClose, images }: Props): ReactElement => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <Box>
        {images.map(image =>
          <Box display='flex' gap={5} alignItems="center" marginBottom={2}>
            <Typography>
              {`Updating localstack/${image.split(':').at(0)}`}
            </Typography>
            <DownloadProgress
              imageName={`localstack/${image.split(':').at(0)}`}
            />
          </Box>,
        )}
      </Box>
    </DialogContent>
  </Dialog>
);
