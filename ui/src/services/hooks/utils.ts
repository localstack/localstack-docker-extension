import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1';
import { useContext } from 'react';
import { GlobalDDContext } from '../context/GlobalDDContext';

export const useDDClient = (): DockerDesktopClient => {
  const { client } = useContext(GlobalDDContext);
  return client;
};
