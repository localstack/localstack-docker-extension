import useSWR from 'swr';
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK } from '../../constants';
import { DockerContainer, RunConfig } from '../../types';
import { useDDClient } from './utils';

interface useRunConfigReturn {
  runConfig: RunConfig[],
  isLoading: boolean,
  setRunConfig: (data: RunConfig[]) => unknown;
}

interface HTTPMessageBody {
  Message: string,
}

export const useRunConfig = (): useRunConfigReturn => {
  const cacheKey = STORAGE_KEY_ENVVARS;
  const ddClient = useDDClient();
  const { data, mutate, isValidating, error } = useSWR(
    cacheKey,
    () => ddClient.extension.vm.service.get('/getConfig'),
  );
  const mutateRunConfig = async (newData: RunConfig[]) => {
    await ddClient.extension.vm.service.post('/setConfig', { Data: JSON.stringify(newData) });
    mutate();
  };

  console.log(data);
  return {
    runConfig: data ? JSON.parse((data as HTTPMessageBody)?.Message) : [],
    isLoading: isValidating || (!error && !data),
    setRunConfig: mutateRunConfig,
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
