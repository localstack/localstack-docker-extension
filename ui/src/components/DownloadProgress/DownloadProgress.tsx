import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient } from '../../services/hooks';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';


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
  callback: () => unknown;
}

export const DownloadProgress = ({ callback }: DownloadProgressProps): ReactElement => {

  const ddClient = useDDClient();
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());

  const percentage = Array.from(statusMap.entries())
    .reduce((partialSum, [, value]) => partialSum + statusValues.get(value), 0) / statusMap.size;

  useEffect(() => {
    ddClient.docker.cli.exec('pull', ['localstack/localstack:latest'], {
      stream: {
        onOutput(data): void {
          if (data.stderr) {
            ddClient.desktopUI.toast.error(data.stderr);
          }

          const [key, status] = data.stdout.split(':').map(item => item.trim());
          if (key === 'Status' || key === 'Digest' || key === 'latest' || status === 'latest') {
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

  return (
    <CircularProgressWithLabel value={Number.isNaN(percentage) ? 0 : percentage} />
  );
};
