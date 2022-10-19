import useSWR from "swr"; 
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK } from "../../constants";
import { DockerContainer, RunConfig } from "../../types";
import { useDDClient } from "./utils";

interface useRunConfigReturn {
  runConfig: RunConfig[],
  setRunConfig: (data: RunConfig[]) => unknown;
}

export const useRunConfig = (): useRunConfigReturn => {
  const cacheKey = STORAGE_KEY_ENVVARS;

  const { data, mutate } = useSWR(
    cacheKey,
    () => JSON.parse(localStorage.getItem(STORAGE_KEY_ENVVARS) as string),
  );
  const mutateRunConfig = (newData: RunConfig[]) => {
    console.log(newData);
    localStorage.setItem(cacheKey, JSON.stringify(newData));
    mutate();
  };

  return {
    runConfig: data || [],
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
