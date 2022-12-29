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
        <Box display="flex" flexGrow={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h3" color={(theme) => theme.palette.text.primary} sx={{ my: 2, mr: 3 }}>
            LocalStack
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() =>
                ddClient.host.openExternal('https://app.localstack.cloud')
              }
              endIcon={<OpenInNew />}
            >
              LocalStack Web Application
            </Button>
          </Box>
        </Box>
        <Controller />
      </Toolbar>
    </AppBar>
  );
};
