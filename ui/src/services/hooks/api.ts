import useSWR from 'swr';
import {
  STORAGE_KEY_ENVVARS,
  STORAGE_KEY_LOCALSTACK,
  STORAGE_KEY_MOUNT,
} from '../../constants';
import {
  ConfigData,
  DockerContainer,
  mountPointData,
  RunConfig,
} from '../../types';
import { isALocalStackContainer, isJson } from '../util';
import { useDDClient } from './utils';

interface useRunConfigsReturn {
  configData: ConfigData;
  isLoading: boolean;
  setRunningConfig: (data: string) => unknown;
  createConfig: (data: RunConfig) => unknown;
  updateConfig: (data: RunConfig) => unknown;
  deleteConfig: (data: string) => unknown;
}

// This is what backend calls send in MacOS
type BaseMessage = {
  Message: string;
};

// This is what backend calls send on Linux
type LinuxMessage = {
  data: BaseMessage;
};

type HTTPMessage = LinuxMessage | BaseMessage;

const isBaseMessage = (msg: HTTPMessage): msg is BaseMessage => (msg as BaseMessage).Message !== undefined;

const resolveOSMessage = (message: HTTPMessage | undefined): BaseMessage | undefined => {
  if (!message) return undefined;
  if (isBaseMessage(message)) return message;
  return message.data;
};

const adaptVersionData = (message: HTTPMessage, error: Error) => {
  const data = resolveOSMessage(message);
  const newData =
    !data || !data?.Message || error
      ? { configs: [], runningConfig: null }
      : JSON.parse(data?.Message);
  if (Array.isArray(newData)) {
    return { configs: newData, runningConfig: newData.at(0).id ?? null };
  }
  return newData;
};

export const useRunConfigs = (): useRunConfigsReturn => {
  const cacheKey = STORAGE_KEY_ENVVARS;
  const { client: ddClient } = useDDClient();
  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    () => ddClient.extension.vm.service.get('/configs') as Promise<HTTPMessage>,
  );

  const updateConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.put('/configs', {
      Data: JSON.stringify(newData),
    });
    mutate();
  };

  const setRunningConfig = async (configId: string) => {
    await ddClient.extension.vm.service.put('/configs/running', {
      Data: JSON.stringify(configId),
    });
    mutate();
  };

  const createConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.post('/configs', {
      Data: JSON.stringify(newData),
    });
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
  user: string | null;
  os: string | null;
  showForm: boolean;
  showSetupWarning: boolean;
  hasSkippedConfiguration: boolean;
  isLoading: boolean;
  setMountPointData: (data: mountPointData) => void;
}

export const useMountPoint = (): useMountPointReturn => {
  const { client: ddClient } = useDDClient();
  const cacheKey = STORAGE_KEY_MOUNT;

  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    async () =>
      ddClient.extension.vm.service.get('/mount') as Promise<HTTPMessage>,
  );

  const setMountPointData = async (data: mountPointData) => {
    await ddClient.extension.vm.service.post('/mount', {
      Data: JSON.stringify(data),
    });
    mutate();
  };

  const adaptedData = resolveOSMessage(data);

  const fileContent = !error && adaptedData ? adaptedData.Message : null;
  const mountPointData = isJson(fileContent)
    ? (JSON.parse(fileContent) as mountPointData)
    : null;

  return {
    user: mountPointData?.user,
    os: mountPointData?.os,
    showForm:
      mountPointData?.showForm == null ? true : mountPointData?.showForm,
    showSetupWarning:
      mountPointData?.showSetupWarning == null
        ? true
        : mountPointData?.showSetupWarning,
    hasSkippedConfiguration: mountPointData?.hasSkippedConfiguration || false,
    isLoading: isValidating || (!error && !adaptedData),
    setMountPointData,
  };
};

interface useLocalStackReturn {
  data: DockerContainer | null;
  mutate: () => void;
}

export const useLocalStack = (): useLocalStackReturn => {
  const { client: ddClient } = useDDClient();
  const cacheKey = STORAGE_KEY_LOCALSTACK;

  const { data, mutate } = useSWR(
    cacheKey,
    async () =>
      ((await ddClient.docker.listContainers()) as [DockerContainer]).find(
        (container) =>
          isALocalStackContainer(container) &&
          container.Command !== 'bin/localstack update docker-images',
      ),
    {
      refreshInterval: 2000,
      compare:
        /*
         * compares whether the old (b) status aligns with that of new (a) status
         */
        (a, b) =>
          a?.Id === b?.Id &&
          a?.Status.includes('unhealthy') === b?.Status.includes('unhealthy'),
    },
  );

  return {
    data,
    mutate,
  };
};
