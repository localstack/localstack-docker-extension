import useSWR from 'swr';
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK } from '../../constants';
import { DockerContainer, RunConfig } from '../../types';
import { useDDClient } from './utils';

interface useRunConfigReturn {
  runConfig: RunConfig[],
  isLoading: boolean,
  setConfig: (data: RunConfig) => unknown;
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
    () => (ddClient.extension.vm.service.get('/get') as Promise<HTTPMessageBody>),
  );

  const updateConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.post('/update', { Data: JSON.stringify(newData) });
    mutate();
  };

  const setConfig = async (newData: RunConfig) => {
    await ddClient.extension.vm.service.post('/set', { Data: JSON.stringify(newData) });
    mutate();
  };

  const deleteConfig = async (configId: string) => {
    await ddClient.extension.vm.service.post('/delete', { Data: configId });
    mutate();
  };

  return {
    runConfig: (!data || data?.Message === '' || error) ? [] : JSON.parse(data?.Message),
    isLoading: isValidating || (!error && !data),
    setConfig,
    updateConfig,
    deleteConfig,
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
      .find(container => container.Image === 'localstack/localstack'),
  );

  return {
    data,
    mutate,
  };
};
