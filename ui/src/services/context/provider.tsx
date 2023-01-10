// eslint-disable-next-line import/no-unresolved
import { createDockerDesktopClient } from '@docker/extension-api-client';
import React, { ReactNode, useMemo } from 'react';
import { GlobalDDContext } from './GlobalDDContext';

interface Props {
  children: ReactNode;
}
const client = createDockerDesktopClient();

export const GlobalDDProvider = ({ children }: Props) => {
  const GlobalDDContextValue = useMemo(() => ({ client }), [client]);

  return (
    <GlobalDDContext.Provider value={GlobalDDContextValue}>
      {children}
    </GlobalDDContext.Provider>
  );
};
