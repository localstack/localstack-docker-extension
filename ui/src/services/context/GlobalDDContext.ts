import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1';
import React from 'react';

export type GlobalDDContextInterface = {
  client: DockerDesktopClient;
};

export const GlobalDDContext = React.createContext<GlobalDDContextInterface>({
  client: null,
});
