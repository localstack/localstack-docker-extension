import React, { Fragment, ReactElement, useEffect } from 'react';
import {
  Box,
  Button,
  Card, CardActions, CardContent, List, ListItem, ListItemText, Theme, Typography,
} from '@mui/material';
import { useLocalStackHealth } from '../../services/hooks/health';
import { HealthState } from '../../types';
import { Capitalize } from '../../services/generic/utils';
import { createStyles, makeStyles } from '@mui/styles';
import { Status as SystemStatusIcon } from './Status';
import { useLocalStack } from '../../services/hooks';
import { Refresh } from '@mui/icons-material';

const ORDER = [
  HealthState.RUNNING,
  HealthState.AVAILABLE,
  HealthState.INITIALIZED,
  HealthState.DISABLED,
  HealthState.ERROR,
];

const useStyles = makeStyles((theme: Theme) => createStyles({
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
}));

export const SystemStatus = (): ReactElement => {
  const { health, mutate } = useLocalStackHealth();
  const { data } = useLocalStack();

  const isRunning = data && data.State === 'running';

  useEffect(
    () => mutate(),
    [isRunning],
  );

  const classes = useStyles();

  const statusesMap = Object.entries(health?.services ?? {}).reduce(
    (memo, [k, v]) => ({ ...memo, [v]: { ...memo[v], [k]: v } }),
    {} as Record<string, Record<string, HealthState>>,
  );


  return (
    <>
      <Card style={{ padding: 10 }}>
        <CardContent>
          <Button
            onClick={mutate}
            variant='outlined'
            style={{ marginBottom: 30 }}
            endIcon={<Refresh />}
          >
            Refresh
          </Button>
          {
            ORDER.map((status) => (
              <Fragment key={status}>
                {statusesMap[status] && (
                  <Box>
                    <Typography variant="caption">
                      {Capitalize(status)}
                    </Typography>
                    <List className={classes.list} dense>
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
            ))
          }
        </CardContent>
        <CardActions>
          {health ?
            <>version : {health?.version}</>
            :
            <>No data available</>
          }

        </CardActions>
      </Card>
    </>
  );
};
