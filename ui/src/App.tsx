import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ControlledTabPanels, Header, LogsPage, ConfigPage, StatusPage, SettingsForm } from './components';
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
  const { showForm, showSetupWarning } = useMountPoint();
  const classes = useStyles();

  return (
    <>
      {showForm &&
        <SettingsForm initialState={showSetupWarning ? 0 : 2} />
      }
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
