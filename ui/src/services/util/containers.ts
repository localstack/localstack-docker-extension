import { PRO_IMAGE } from '../../constants';
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

const removeDockerTag = (imageString:string ) => {
  // Split the image string by ":" to check if it has a tag
  const parts = imageString.split(':');
  
  // If there is no tag, return the original string as is
  if (parts.length === 1) {
    return imageString;
  }
  
  // If there is a tag, return the part before the last ":" (image without tag)
  return parts.slice(0, -1).join(':');
};
export function removeTagFromImage(image: DockerImage){
  return removeDockerTag(image.RepoTags?.at(0));
}

export const isALocalStackContainer = (container: DockerContainer) => {
  const image = removeDockerTag(container.Image);
  return image === 'localstack/localstack' || image === PRO_IMAGE;
};
