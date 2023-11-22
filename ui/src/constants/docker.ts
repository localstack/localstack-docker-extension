import { PRO_IMAGE } from './common';

const COMMON_ARGS = [
  '-i',
  '--rm',
  '--entrypoint=',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
  PRO_IMAGE,
  './.venv/bin/python3',
  '-m',
  'localstack.cli.main',
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
  'DOCKER_FLAGS=--label com.docker.compose.project=localstack_localstack-docker-desktop-desktop-extension --label com.docker.desktop.extension=true --label com.docker.compose.project.config_files',
];
