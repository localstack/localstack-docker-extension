import { PRO_IMAGE, COMMUNITY_IMAGE } from './common';

export const COMMON_ARGS = [
  '--label',
  'cloud.localstack.spawner=true',
  '--rm',
  '-i',
  '--entrypoint=',
  '-v',
  '/var/run/docker.sock:/var/run/docker.sock',
];

export const PRO_CLI = [
  PRO_IMAGE,
  './.venv/bin/python3',
  '-m',
  'localstack.cli.main',
];

export const COMMUNITY_CLI = [COMMUNITY_IMAGE, 'bin/localstack'];

export const START_ARGS = [
  'start',
  '-d',
];

export const UPDATE_ARGS = [
  'update',
  'docker-images',
];

export const FLAGS = [
  '-e',
  // eslint-disable-next-line max-len
  'DOCKER_FLAGS=--label com.docker.compose.project=localstack_localstack-docker-desktop-desktop-extension --label com.docker.desktop.extension=true --label com.docker.compose.project.config_files',
];
