import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ControlledTabPanels, Header, Logs, OnBoarding, StartConfigs, SystemStatus } from './components';
import { useMountPoint } from './services/hooks';

const useStyles = makeStyles(() => createStyles({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
}));

export const App = (): ReactElement => {
  const [selected, setSelected] = useState<number>(0);
  const { data: mountPoint } = useMountPoint();
  const classes = useStyles();
  const shouldDialogOpen = !mountPoint || mountPoint === '';

  return (
    <>
      { shouldDialogOpen && <OnBoarding/> }
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
