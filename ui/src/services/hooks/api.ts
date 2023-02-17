import useSWR from 'swr';
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK, STORAGE_KEY_MOUNT } from '../../constants';
import { DockerContainer, RunConfig } from '../../types';
import { isALocalStackContainer } from '../util';
import { useDDClient } from './utils';

interface useRunConfigReturn {
  runConfig: RunConfig[],
  isLoading: boolean,
  createConfig: (data: RunConfig) => unknown;
  updateConfig: (data: RunConfig) => unknown;
  deleteConfig: (data: string) => unknown;
}

interface HTTPMessageBody {
  Message: string,
}

export const useRunConfig = (): useRunConfigReturn => {
  const cacheKey = STORAGE_KEY_ENVVARS;
  const ddClient = useDDClient();
  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    () => (ddClient.extension.vm.service.get('/configs') as Promise<HTTPMessageBody>),
  );

  const updateConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.put('/configs', { Data: JSON.stringify(newData) });
    mutate();
  };

  const createConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.post('/configs', { Data: JSON.stringify(newData) });
    mutate();
  };

  const deleteConfig = async (configId: string) => {
    await ddClient.extension.vm.service.delete(`/configs/${configId}`);
    mutate();
  };

  return {
    runConfig: (!data || data?.Message === '' || error) ? [] : JSON.parse(data?.Message),
    isLoading: isValidating || (!error && !data),
    createConfig,
    updateConfig,
    deleteConfig,
  };
};

interface useMountPointReturn {
  data: string | null,
  isLoading: boolean,
  setMountPointUser: (data: string) => unknown;
}

export const useMountPoint = (): useMountPointReturn => {
  const ddClient = useDDClient();
  const cacheKey = STORAGE_KEY_MOUNT;

  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    async () => (ddClient.extension.vm.service.get('/mount') as Promise<HTTPMessageBody>),
  );

  const setMountPointUser = async (user: string) => {
    await ddClient.extension.vm.service.post('/mount', { Data: user });
    mutate();
  };

  return {
    data: (!error && data) ? data.Message : null,
    isLoading: isValidating || (!error && !data),
    setMountPointUser,
  };
};

interface useLocalStackReturn {
  data: DockerContainer | null,
  mutate: () => void;
}

export const useLocalStack = (): useLocalStackReturn => {
  const ddClient = useDDClient();
  const cacheKey = STORAGE_KEY_LOCALSTACK;

  const { data, mutate } = useSWR(
    cacheKey,
    async () => (await ddClient.docker.listContainers() as [DockerContainer])
      .find(container =>
        isALocalStackContainer(container) && container.Command !== 'bin/localstack update docker-images',
      ), {
      refreshInterval: 2000, compare:
      /*
       * compares whether the old (b) status aligns with that of new (a) statuss
       */
      (a, b) => a?.Id === b?.Id && a?.Status.includes('unhealthy') === b?.Status.includes('unhealthy'), 
    },
  );

  return {
    data,
    mutate,
  };
};
