export enum HealthState {
  INITIALIZED = 'initialized',
  AVAILABLE = 'available',
  RUNNING = 'running',
  ERROR = 'error',
  DISABLED = 'disabled',
}

export interface Health {
  features: {
    [key: string]: HealthState;
  },
  services: {
    [key: string]: HealthState;
  },
  version: string;
}
