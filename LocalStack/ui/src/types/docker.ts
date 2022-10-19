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

export interface DockerContainer {
  Command: string,
  Created: number,
  HostConfig: object,
  Id: string,
  Image: string,
  ImageID: string,
  Labels: Labels,
  Mounts : [object],
  Names: [string],
  NetworkSettings: object,
  Ports: [Port],
  State: string,
  Status: string
 }

interface Labels {
  [key: string]: string,
}

interface Port {
  IP: string,
  PrivatePort: number,
  PublicPort: number,
  Type: string,
}
