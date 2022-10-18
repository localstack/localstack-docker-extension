import React, { Fragment, ReactElement, useEffect } from 'react';
import {
  Box,
  Card, CardActions, CardContent, List, ListItem, ListItemText, Skeleton, Theme, Typography,
} from '@mui/material';
import { useLocalStackHealth } from '../service/hooks/health';
import { HealthState } from '../types';
import { Capitalize } from '../service/generic/utils';
import { createStyles, makeStyles } from '@mui/styles';
import { Status as SystemStatusIcon} from './Status';
import { useLocalStack } from '../service/hooks';

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
      {
        health ?
          <Card style={{ padding: 10 }}>
            <CardContent>
              {ORDER.map((status) => (
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
              ))}
            </CardContent>
            <CardActions>
              version: {health?.version}
            </CardActions>
          </Card>
          :
          <>
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </>
      }
    </>
  );
};
