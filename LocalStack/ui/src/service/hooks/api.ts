import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { STORAGE_KEY_ENVVARS, STORAGE_KEY_LOCALSTACK } from "../../constants";
import { DockerContainer } from "../../types";
import { useDDClient } from "./utils";

type UseGlobalSwr = {
  mutateRelated: (key: unknown, value?: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  clearAll: () => void;
};

const useGlobalSwr = (): UseGlobalSwr => {
  const { cache, mutate } = useSWRConfig();
  /**
   * This function will revalidate (reload)
   * any data that includes the specified cache key or its part.

   */
  const mutateRelated = useCallback(async (key: unknown, value?: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
    const notInternalCacheKey = (k: string): boolean => !k.startsWith('$req$') && !k.startsWith('$err$');
    Array.from((cache as Map<string, unknown>).keys()).forEach((k) => {
      if (k.includes(cacheKey)) {
        cache.delete(k);
        if (value && notInternalCacheKey(k)) {
          mutate(k, value);
        } else if (notInternalCacheKey(k)) {
          mutate(k);
        }
      }
    });
  }, [cache, mutate]);

  const clearAll = useCallback(() => {
    Array.from((cache as Map<string, unknown>).keys()).forEach((k) => cache.delete(k));
  }, [cache]);

  return { mutateRelated, clearAll };
};

interface envVar {
  variable: string,
  value: string,
  id: string;
}

interface useEnvVarsReturn {
  envVars: envVar[],
  setEnvVars: (data: envVar[]) => unknown;
}


export const useEnvVars = (): useEnvVarsReturn => {
  const cacheKey = STORAGE_KEY_ENVVARS;
  const { mutateRelated } = useGlobalSwr();

  const { data } = useSWR(
    cacheKey,
    () => JSON.parse(localStorage.getItem(STORAGE_KEY_ENVVARS) as string),
  );
  const mutateEnvVars = (newData: envVar[]) => {
    localStorage.setItem(cacheKey, JSON.stringify(newData));
    mutateRelated(cacheKey);
  };

  return {
    envVars: data || [],
    setEnvVars: mutateEnvVars,
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
      .find(container => container.Image === 'localstack/localstack'), { refreshInterval: 2000 },
  );

  return {
    data,
    mutate,
  };
};
