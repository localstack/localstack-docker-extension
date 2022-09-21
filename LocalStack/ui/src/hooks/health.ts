import useSWR from 'swr';
import axios, { AxiosError } from 'axios';
import { SwrCacheKey } from "../constants/index";

export enum HealthState {
  INITIALIZED = 'initialized',
  AVAILABLE = 'available',
  RUNNING = 'running',
  ERROR = 'error',
  DISABLED = 'disabled',
}

declare type Optional<T> = T | null | undefined;

interface Health {
  features: {
    [key: string]: HealthState;
  },
  services: {
    [key: string]: HealthState;
  },
  version: string;
}

interface UseResourcesGraph {
  health: Optional<Health>,
  isLoading: boolean;
  isError: boolean;
  error?: Error | AxiosError;
  mutate: () => void;
}

export const getDockerStatus = async (): Promise<Health> => {
  try {
    const { data } = await axios.create({ baseURL: 'http://localhost:4566' }).get('health');
    return data;
  } catch (_error) {
    return undefined;
  }
};

export const useLocalStackHealth = (): UseResourcesGraph => {
  const { data, error, isValidating, mutate } = useSWR<Health>(
    SwrCacheKey.HEALTH,
    () => getDockerStatus(), { refreshInterval: 2000 },
  );

  return {
    health: data,
    isLoading: isValidating || (!error && !data),
    isError: !!error,
    error,
    mutate,
  };
};
