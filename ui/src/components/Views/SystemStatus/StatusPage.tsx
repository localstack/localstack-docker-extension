import React, { Fragment, ReactElement, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Link,
  List,
  ListItem,
  ListItemText,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Refresh } from '@mui/icons-material';
import { SystemStatus as SystemStatusIcon } from './SystemStatus';
import {
  useLocalStackHealth,
  useLocalStack,
  capitalize,
  useDDClient,
} from '../../../services';
import { HealthState } from '../../../types';

const ORDER = [
  HealthState.RUNNING,
  HealthState.AVAILABLE,
  HealthState.INITIALIZED,
  HealthState.DISABLED,
  HealthState.ERROR,
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      [theme.breakpoints.down('xs')]: {
        gridTemplateColumns: 'repeat(1, 1fr)',
      },
    },
    servicesBlock: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

const LICENSE_DOCS_URL =
  'https://docs.localstack.cloud/aws/getting-started/auth-token/#configuring-your-auth-token';

export const StatusPage = (): ReactElement => {
  const { health, mutate } = useLocalStackHealth();
  const { data } = useLocalStack();
  const { client: ddClient } = useDDClient();

  const isRunning = data && data.State === 'running';

  const isPro = health && health.edition !== 'community';

  useEffect(() => mutate(), [isRunning]);

  const classes = useStyles();

  const statusesMap = Object.entries(health?.services ?? {}).reduce(
    (memo, [k, v]) => ({ ...memo, [v]: { ...memo[v], [k]: v } }),
    {} as Record<string, Record<string, HealthState>>,
  );

  return (
    <Box m={2}>
      <Button
        onClick={mutate}
        variant="outlined"
        style={{ marginBottom: 30 }}
        endIcon={<Refresh />}
      >
        Refresh
      </Button>
      {isPro ? (
        <div className={classes.servicesBlock}>
          {ORDER.map((status) => (
            <Fragment key={status}>
              {statusesMap[status] && (
                <Box>
                  <Typography variant="caption">
                    {capitalize(status)}
                  </Typography>
                  <List
                    className={classes.list}
                    dense
                    style={{ display: 'grid' }}
                  >
                    {Object.entries(statusesMap[status] ?? {}).map(([k, v]) => (
                      <ListItem key={k}>
                        <ListItemText
                          primary={k}
                          secondary={<SystemStatusIcon state={v} />}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        // Your updated component
        <Alert severity="warning">
          Could not connect to a licensed LocalStack instance.{' '}
          <Link
            href={LICENSE_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            color="inherit"
            underline="always"
            onClick={(event) => {
              event.preventDefault();
              ddClient.host.openExternal(LICENSE_DOCS_URL);
            }}
          >
            Learn how to configure your license
          </Link>
        </Alert>
      )}
      {health ? <>version : {health?.version}</> : <>No data available</>}
    </Box>
  );
};
