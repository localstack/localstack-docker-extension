import useSWR from 'swr';
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK, STORAGE_KEY_MOUNT } from '../../constants';
import { ConfigData, DockerContainer, mountPointData, RunConfig } from '../../types';
import { isALocalStackContainer, isJson } from '../util';
import { useDDClient } from './utils';

interface useRunConfigsReturn {
  configData: ConfigData,
  isLoading: boolean,
  setRunningConfig: (data: string) => unknown;
  createConfig: (data: RunConfig) => unknown;
  updateConfig: (data: RunConfig) => unknown;
  deleteConfig: (data: string) => unknown;
}

interface HTTPMessageBody {
  Message: string,
}

const adaptVersionData = (data: HTTPMessageBody, error: Error) => {
  const newData = (!data || !data?.Message || error) ?
    { configs: [], runningConfig: null }
    :
    JSON.parse(data?.Message);
  if (Array.isArray(newData)) {
    return { configs: newData, runningConfig: newData.at(0).id ?? null };
  }
  return newData;
};

export const useRunConfigs = (): useRunConfigsReturn => {
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

  const setRunningConfig = async (configId: string) => {
    await ddClient.extension.vm.service.put('/configs/running', { Data: JSON.stringify(configId) });
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
    configData: adaptVersionData(data, error),
    isLoading: isValidating || (!error && !data),
    setRunningConfig,
    createConfig,
    updateConfig,
    deleteConfig,
  };
};

interface useMountPointReturn {
  user: string | null,
  os: string | null,
  showForm: boolean,
  showSetupWarning: boolean,
  hasSkippedConfiguration: boolean,
  isLoading: boolean,
  setMountPointData: (data: mountPointData) => void;
}

export const useMountPoint = (): useMountPointReturn => {
  const ddClient = useDDClient();
  const cacheKey = STORAGE_KEY_MOUNT;

  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    async () => (ddClient.extension.vm.service.get('/mount') as Promise<HTTPMessageBody>),
  );

  const setMountPointData = async (data: mountPointData) => {
    await ddClient.extension.vm.service.post('/mount', { Data: JSON.stringify(data) });
    mutate();
  };

  const fileContent = (!error && data) ? data.Message : null;
  const mountPointData = isJson(fileContent) ? JSON.parse(fileContent) as mountPointData : null;

  return {
    user: mountPointData?.user,
    os: mountPointData?.os,
    showForm: mountPointData?.showForm == null ? true : mountPointData?.showForm,
    showSetupWarning: mountPointData?.showSetupWarning == null ? true : mountPointData?.showSetupWarning,
    hasSkippedConfiguration: mountPointData?.hasSkippedConfiguration || false,
    isLoading: isValidating || (!error && !data),
    setMountPointData,
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
       * compares whether the old (b) status aligns with that of new (a) status
       */
      (a, b) => a?.Id === b?.Id && a?.Status.includes('unhealthy') === b?.Status.includes('unhealthy'),
    },
  );

  return {
    data,
    mutate,
  };
};
