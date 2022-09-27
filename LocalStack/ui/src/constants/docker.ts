const COMMON_ARGS = [
/* remove comment to allow accessing health without cors blocking when changing UI-source to localhost
  '-e',   
  'EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000', 
  */
  '--rm',
  '-i',
  '--entrypoint=',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
  'localstack/localstack',
  'bin/localstack',
];

export const START_ARGS = [
  '-e',
  'LOCALSTACK_VOLUME_DIR=/tmp',
  ...COMMON_ARGS,
  'start',
  '-d',
];

export const STATUS_ARGS = [
  ...COMMON_ARGS,
  'status',
];

export const STOP_ARGS = [
  ...COMMON_ARGS,
  'stop',
];
