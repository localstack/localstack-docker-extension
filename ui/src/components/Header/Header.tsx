import { OpenInNew } from '@mui/icons-material';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import React, { ReactElement } from 'react';
import { useDDClient } from '../../services/hooks';
import { Controller } from './Controller';

export const Header = (): ReactElement => {
  const ddClient = useDDClient();

  return (
    <AppBar position="relative" elevation={0}>
      <Toolbar>
        <Box display='flex' flexGrow={1}>
          <Typography variant='h3' sx={{ my: 2, mr: 3 }}>
            LocalStack
          </Typography>
          <Button
            color="inherit"
            onClick={() => ddClient.host.openExternal('https://app.localstack.cloud')}
            endIcon={<OpenInNew />}
          >
            Web App
          </Button>
        </Box>
        <Controller />

      </Toolbar>
    </AppBar>
  );
};
