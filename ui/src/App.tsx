import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ControlledTabPanels, Header, LogsPage, MountPointForm, ConfigPage, StatusPage } from './components';
import { useDDClient, useMountPoint } from './services/hooks';

const useStyles = makeStyles(() => createStyles({
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
}));

export const App = (): ReactElement => {
  const [selected, setSelected] = useState<number>(0);
  const { user, os } = useMountPoint();
  const classes = useStyles();
  const ddClient = useDDClient();
  const userPresent = !user;
  const shouldDialogOpen = ddClient.host.platform === 'win32' ? !os || userPresent : userPresent;

  return (
    <>
      {shouldDialogOpen && <MountPointForm />}
      <div className={classes.sticky}>
        <Header />
      </div>
      <ControlledTabPanels
        onTabChange={(_, to) => setSelected(to)}
        selected={selected}
        options={[
          {
            label: 'System Status',
            panel: <StatusPage />,
          },
          {
            label: 'Configurations',
            panel: <ConfigPage />,
          },
          {
            label: 'Logs',
            panel: <LogsPage />,
          },
        ]}
      />
    </>
  );
};
