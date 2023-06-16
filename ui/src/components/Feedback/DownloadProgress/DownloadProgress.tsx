import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient } from '../../../services';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';

const SKIPPING_KEY = 'latest';
const END_KEYS = ['Digest', 'Status'];

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
    setIsDone(false);
    setStatusMap(new Map());
    ddClient.docker.cli.exec('pull', [imageName], {
      stream: {
        onOutput(data): void {
          if (data.stderr) {
            ddClient.desktopUI.toast.error(data.stderr);
          }

          const [key, status] = data.stdout.split(':').map(item => item.trim());

          if ([key, status].includes(SKIPPING_KEY)) { // prevent inserting in the map non related info
            return;
          }

          if (status.startsWith('Image is up to date') || END_KEYS.includes(key)) {
            setIsDone(true);
            return;
          }
          if (!status.startsWith('Retrying in')) {
            setStatusMap(new Map(statusMap.set(key, status)));
          }
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
  }, [imageName]);

  const percentageValue = Number.isNaN(percentage) ? 0 : percentage;
  return (
    <CircularProgressWithLabel value={isDone ? 100 : percentageValue} />
  );
};
