export interface DockerImage {
 Containers: number,
 Created: number,
 Id: string,
 Labels: Labels,
 ParentId: string,
 RepoDigest: [string],
 RepoTags: [string],
 SharedSize: number,
 Size: number,
 VirtualSize: number,
}

interface Labels {
  [key: string]: string,
}
