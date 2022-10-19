import React, { useState, useEffect, ReactNode } from 'react';
import { Tabs, Tab, TabsProps } from '@mui/material';

export const TabPanel: React.FC<{ index: number; tab: number }> = ({
  children,
  index,
  tab,
}) => (
  <div role="tabpanel" hidden={tab !== index}>
    {children}
  </div>
);

export interface ControlledTabPanelsProps {
  selected?: number;
  onTabChange?: (from: number, to: number) => void;
  options: { label: string; panel: ReactNode }[];
}

/**
 * Material UI Tab switching with automatic state handling.
 */
export const ControlledTabPanels: React.FC<ControlledTabPanelsProps & TabsProps> = ({
  selected,
  onTabChange,
  options,
  ...rest
}) => {
  const [tab, setTab] = useState(selected || 0);
  const switchTab = (newValue: number) => {
    if (onTabChange) {
      onTabChange(tab, newValue);
    }
    setTab(newValue);
  };

  useEffect(() => {
    if (selected !== undefined) {
      setTab(selected);
    }
  }, [selected]);

  return (
    <>
      <Tabs
        variant="fullWidth"
        {...rest}
        value={tab}
        onChange={(_event, newValue) => switchTab(newValue)}
      >
        {options.map(({ label }) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
      {options.map(({ label, panel }, index) => (
        <TabPanel key={label} tab={tab} index={index}>
          {panel}
        </TabPanel>
      ))}
    </>
  );
};
