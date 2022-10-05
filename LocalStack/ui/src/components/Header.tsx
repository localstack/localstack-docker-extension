import React from 'react';
import {
  Box,
  Button,
  Theme,
  Typography,
} from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import { OpenInNew } from '@mui/icons-material';
import { useDDClient } from '../service/hooks';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: 'primary.dark',
    },
    title: {
      fontWeight: theme.typography.fontWeightBold,
      fontSize: 28,
    },
    link: {
      color: theme.palette.background.paper,
    },
  }),
);


export const Header = () => {
  const classes = useStyles();
  const ddClient = useDDClient();

  return (
    <>
      <Box p={2} className={classes.root}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Box ml={2}>
              <Typography style={{ fontSize: 28 }} className={classes.title}>
                LocalStack
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button
              className={classes.link}
              onClick={() => ddClient.host.openExternal("https://app.localstack.cloud")}
              endIcon={<OpenInNew />}
            >
              Web App
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};
