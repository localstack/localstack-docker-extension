import { Divider } from '@mui/material';
import React, { useState } from 'react';
import { ControlledTabPanels, SystemStatus, Header, Logs, StartConfigs } from './components';

export function App() {
  const [selected, setSelected] = useState<number>(0);

  return (
    <>
      <Header />
      <Divider/>
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
