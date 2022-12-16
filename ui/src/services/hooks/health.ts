import useSWR from 'swr';
import axios, { AxiosError } from 'axios';
import { SwrCacheKey } from '../../constants/index';
import { Optional, Health } from '../../types';

interface UseResourcesGraph {
  health: Optional<Health>,
  isLoading: boolean;
  isError: boolean;
  error?: Error | AxiosError;
  mutate: () => void;
}

export const getDockerStatus = async (): Promise<Health> => {
  try {
    const { data } = await axios.create({ baseURL: 'http://localhost:4566' }).get('_localstack/health');
    return data;
  } catch (_error) {
    return undefined;
  }
};

export const useLocalStackHealth = (): UseResourcesGraph => {
  const { data, error, isValidating, mutate } = useSWR<Health>(
    SwrCacheKey.HEALTH,
    () => getDockerStatus(), { revalidateOnMount: true, refreshInterval: 2000 },
  );

  return {
    health: data,
    isLoading: isValidating || (!error && !data),
    isError: !!error,
    error,
    mutate,
  };
};
