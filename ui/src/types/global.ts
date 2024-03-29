export declare type Optional<T> = T | null | undefined;

interface envVar {
  [x: string]: string;
  variable: string,
  value: string,
  id: string;
  description?: string;
}

export interface RunConfig {
  name: string,
  id: string,
  vars: Optional<envVar[]>,
}

export interface ConfigData {
  runningConfig: string,
  configs: RunConfig[],
}

export interface mountPointData {
  user: string,
  os: string,
  showForm: boolean,
  showSetupWarning: boolean,
  hasSkippedConfiguration: boolean,
}
