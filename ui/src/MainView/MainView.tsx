import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ControlledTabPanels, Header, Logs, StartConfigs, SystemStatus } from './components';

const useStyles = makeStyles(() => createStyles({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
}));

export const MainView = (): ReactElement => {
  const [selected, setSelected] = useState<number>(0);
  const classes = useStyles();

  return (
    <>
      <div className={classes.sticky}>
        <Header />
      </div>
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
};
