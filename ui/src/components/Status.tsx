import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import classnames from 'classnames';
import React, { ReactElement } from 'react';
import { HealthState } from '../types';

const useStyles = makeStyles((theme: Theme) => createStyles({
  dot: {
    display: 'inline-block',
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: theme.spacing(.5),
    marginRight: theme.spacing(1),
  },
  available: {
    backgroundColor: theme.palette.info.main,
  },
  disabled: {
    backgroundColor: theme.palette.action.disabledBackground,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
  initialized: {
    backgroundColor: theme.palette.info.main,
  },
  running: {
    backgroundColor: theme.palette.success.main,
  },
}));

export interface SystemStatusProps {
  state: HealthState;
}

export const Status = ({ state }: SystemStatusProps): ReactElement => {
  const classes = useStyles();

  return (
    <span>
      <span
        className={classnames(classes.dot, {
          [classes.available]: state === HealthState.AVAILABLE,
          [classes.disabled]: state === HealthState.DISABLED,
          [classes.error]: state === HealthState.ERROR,
          [classes.initialized]: state === HealthState.INITIALIZED,
          [classes.running]: state === HealthState.RUNNING,
        })}
      />
      {state}
    </span>
  );
};
