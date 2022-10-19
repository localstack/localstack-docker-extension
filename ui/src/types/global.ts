export declare type Optional<T> = T | null | undefined;

interface envVar {
  [x: string]: string;
  variable: string,
  value: string,
  id: string;
}

export interface RunConfig {
  name: string,
  id: string,
  vars: Optional<envVar[]>,
}
