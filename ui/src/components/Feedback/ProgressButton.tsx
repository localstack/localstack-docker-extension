import React, { ReactElement } from 'react';
import { ButtonProps, Button, LinearProgress } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'inline-block',
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
}));

type Props = ButtonProps & {
  loading?: boolean;
}

export const ProgressButton = ({ loading, children, disabled, ...rest }: Props): ReactElement => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Button {...rest} disabled={loading || disabled}>
        {children}
      </Button>
      {loading && <LinearProgress className={classes.progress} />}
    </div>
  );
};
