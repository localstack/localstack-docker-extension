const COMMON_ARGS = [
  '--label',
  'cloud.localstack.spawner=true',
  '--rm',
  '-i',
  '--entrypoint=',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
  'localstack/localstack:2.1.0',
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

export const UPDATE_ARGS = [
  ...COMMON_ARGS,
  'update',
  'docker-images',
];

export const FLAGS = [
  '-e',
  // eslint-disable-next-line max-len
  'DOCKER_FLAGS=\'--label com.docker.compose.project=localstack_localstack-docker-desktop-desktop-extension --label com.docker.desktop.extension=true --label com.docker.compose.project.config_files\'',
];
