import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1';
import { useContext } from 'react';
import { GlobalDDContext } from '../context/GlobalDDContext';


export interface useDDClientReturn {
  client: DockerDesktopClient,
  getBinary: () => string,
}


export const useDDClient = (): useDDClientReturn => {
  const { client } = useContext(GlobalDDContext);
  const getBinary = () => {
    let architecture = '';
    if (client.host.arch === 'x64') {
      architecture = 'amd';
    } else if (client.host.arch === 'arm64') {
      architecture = 'arm';
    } else {
      client.desktopUI.toast.error(`Extension does not support ${client.host.arch} architecture`);
      return null;
    }

    let os = '';
    if (client.host.platform === 'darwin' || client.host.platform === 'linux') {
      os = client.host.platform;
    } else if (client.host.platform === 'win32' && architecture === 'amd') {
      os = 'windows';
    } else {
      client.desktopUI.toast.error(
        `Extension does not support ${client.host.platform} operating system platform (${architecture})`,
      );
      return null;
    }

    const fullName = `localstack-${os}-$(architecture}${os === 'windows' ? '.exe' : ''}`;
    return fullName;
  };

  return {
    client,
    getBinary,
  };
};
