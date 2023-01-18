const COMMON_ARGS = [
  '--rm',
  '-i',
  '-e',
  'DNS_ADDRESS=0',
  '--entrypoint=',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
  'localstack/localstack',
  'bin/localstack',
];

export const START_ARGS = [
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

export const UPDATE_ARGS = [
  ...COMMON_ARGS,
  'update',
  'docker-images',
];


export const SDK_START_ARGS = [
  '--rm',
  '-i',
  '-d',
  '--name',
  'localstack_main',
  '-e',
  'TEST_AWS_ACCOUNT_ID=000000000000',
  '-e',
  'DOCKER_HOST=unix:///var/run/docker.sock',
  '-e',
  'SET_TERM_HANDLER=1',
  '-p',
  '127.0.0.1:4566:4566', // gateway
  '-p',
  '127.0.0.1:4510-4559:4510-4559', // services
  '-p',
  '127.0.0.1:12121:12121',
  '-p',
  '127.0.0.1:4571:4571',
  '-p',
  '127.0.0.1:433:433',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
];
