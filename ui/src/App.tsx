import { Divider } from '@mui/material';
import React, { useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ControlledTabPanels, SystemStatus, Header, Logs, StartConfigs } from './components';

const useStyles = makeStyles(() => createStyles({
  sticky: {
    position: 'sticky',
    top: 0,
  },
}));

export function App() {
  const [selected, setSelected] = useState<number>(0);
  const classes = useStyles();

  return (
    <>
      <div className={classes.sticky}>
        <Header />
      </div>
      <Divider />
      <ControlledTabPanels
        onTabChange={(_, to) => setSelected(to)}
        selected={selected}
        options={[
          {
            label: 'System Status',
            panel: <SystemStatus />,
          },
          {
            label: 'Configurations',
            panel: <StartConfigs />,
          },
          {
            label: 'Logs',
            panel: <Logs />,
          },
        ]}
      />
    </>
  );
}
