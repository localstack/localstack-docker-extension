import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient } from '../../../services';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';

const skippingKeys = ['Digest','Status','latest']; 

const statusValues = new Map([
  ['Waiting', 0],
  ['Pulling fs layer', 25],
  ['Verifying Checksum', 25],
  ['Downloading', 50],
  ['Download complete', 75],
  ['Extracting', 90],
  ['Pull complete', 100],
  ['Already exists', 100],
]);

interface DownloadProgressProps {
  callback?: () => unknown;
  imageName: string;
}

export const DownloadProgress = ({ callback, imageName }: DownloadProgressProps): ReactElement => {

  const ddClient = useDDClient();
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());
  const [isDone, setIsDone] = useState<boolean>(false);
  const percentage = Array.from(statusMap.entries())
    .reduce((partialSum, [, value]) => partialSum + statusValues.get(value), 0) / statusMap.size;

  useEffect(() => {
    ddClient.docker.cli.exec('pull', [imageName], {
      stream: {
        onOutput(data): void {
          if (data.stderr) {
            ddClient.desktopUI.toast.error(data.stderr);
          }

          const [key, status] = data.stdout.split(':').map(item => item.trim());

          if (skippingKeys.includes(key) || status === 'latest') { // don't process lines that are not in the format hash: status
            return;
          }
          
          if (status.startsWith('Image is up to date')) { // otherwise if Image is up to date nothing is downloaded and the progress remains to 0
            setIsDone(true);
            return;
          }

          setStatusMap(new Map(statusMap.set(key, status)));
        },
        onError(error: unknown): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error);
        },
        onClose(): void {
          callback();
        },
        splitOutputLines: true,
      },
    });
  }, []);

  const percentageValue = Number.isNaN(percentage) ? 0 : percentage;
  return (
    <CircularProgressWithLabel value={isDone ? 100 : percentageValue} />
  );
};
