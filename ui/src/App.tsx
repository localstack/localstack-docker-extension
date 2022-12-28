import React, { useEffect, useState } from 'react';
import { useDDClient, useMountPoint } from './services/hooks';
import { OnBoarding } from './MainView/components/Configs/OnBoarding';
import { MainView } from './MainView/MainView';


export function App() {
  const ddClient = useDDClient();
  const { data, isLoading } = useMountPoint();
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    const checkHomeDir = async () => {
      const path = ddClient.host.platform === 'darwin' ? 'Users' : 'home';
      const res = await ddClient.docker.cli.exec('run',
        ['--entrypoint=', '-v', `/${path}:/users`, 'localstack/localstack', 'ls', '/users']);

      const foundUsers = res.stdout.split('\n');
      foundUsers.pop(); // remove last '' element
      if (foundUsers.join(',') !== users.join(',')) {
        setUsers(foundUsers);
      }
    };

    checkHomeDir();
  }, [users]);

  return (
    (data && data !== '') ? <MainView /> : <OnBoarding users={users} loading={isLoading || users.length === 0} />
  );
}
