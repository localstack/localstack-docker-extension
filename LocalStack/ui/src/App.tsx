import React, { useState } from 'react';
import { ControlledTabPanels, Controller, Logs, StartOptions } from './components';

export function App() {
  const [selected, setSelected] = useState<number>(0);

  return (
    <>
      <ControlledTabPanels
        onTabChange={(_, to) => setSelected(to)}
        selected={selected}
        options={[
          {
            label: 'System Status',
            panel: <Controller />,
          },
          {
            label: 'Starting Options',
            panel: <StartOptions />,
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
