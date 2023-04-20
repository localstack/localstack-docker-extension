import { DockerContainer, DockerImage } from '../../types';

/**
 * Removes repo from image identifier 
 * 
 * @param repoTag string in the format of repo/name:tag (Ex localstack/localstack:latest)
 * @returns the name and tag of the string (name:tag)
 */
export function removeRepoFromImage(repoTag: string) {
  return repoTag.split('/').at(-1);
}

export function removeTagFromImage(image: DockerImage){
  return image.RepoTags[0].split(':').slice(0, -1).join(':');
}

export const isALocalStackContainer = (container: DockerContainer) =>
  (container.Image === 'localstack/localstack' || container.Image === 'localstack/localstack-pro');
