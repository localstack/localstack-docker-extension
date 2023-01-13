import { LATEST_IMAGE } from '../../constants';
import { DockerImage } from '../../types';
import { useDDClient } from '../hooks';

export function Capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const checkLocalImage = async () => {
  const ddClient = useDDClient();
  const images = await ddClient.docker.listImages() as [DockerImage];
  return !images.some(image => image.RepoTags?.at(0) === LATEST_IMAGE);
};
