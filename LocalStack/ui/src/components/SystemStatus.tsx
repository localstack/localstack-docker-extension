import React, { ReactElement } from 'react';
import { Card, CardActions, Skeleton } from '@mui/material';
import { useLocalStackHealth } from '../service/hooks/health';

export const SystemStatus = (): ReactElement => {
  const { health } = useLocalStackHealth();

  return (
    <>
      {
        health ?
          <Card style={{ padding: 10 }}>
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
