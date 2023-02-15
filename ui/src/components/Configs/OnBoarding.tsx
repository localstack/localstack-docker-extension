
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { LATEST_IMAGE } from '../../constants';
import { removeNullBytes } from '../../services/generic/utils';
import { useDDClient, useMountPoint } from '../../services/hooks';
import { DockerImage } from '../../types';
import { DownloadProgress } from '../DownloadProgress/DownloadProgress';

const EXCLUDED_WSL = ['docker-desktop','docker-desktop-data'];

export const OnBoarding = (): ReactElement => {
  
  const [userState, setUserState] = useState({ loading: false, selectedUser: '', users: [] });
  const [osState, setOsState] = useState({ loading: false, selectedOS: '', OSs: [] });
  const [hasLocalImage, setHasLocalImage] = useState({ checking: true, isPresent: false });
  const [isPullingImage, setIsPullingImage] = useState(false);
  const [triggerFirstUseEffect, setTriggerFirstUseEffect] = useState(false);
  const [triggerSecondUseEffect, setTriggerSecondUseEffect] = useState(false);

  const { setMountPointUser } = useMountPoint();
  const ddClient = useDDClient();

  const buildLSArguments = (mountPath: string): string[] =>
    ['--rm', '--entrypoint=', '-v', `${mountPath}:/users`, 'localstack/localstack', 'ls', '/users'];

  const getPathValue = () => {
    if(ddClient.host.platform === 'win32'){
      return `\\\\wsl$\\${osState.selectedOS}\\home`;
    }
    return ddClient.host.platform === 'darwin' ? '/Users' : '/home';
  };
      
  const checkWindowsDistro = async () => {
    setOsState({ ...osState, loading: true});

    const res = await ddClient.extension.host?.cli.exec('checkwsl.cmd',[]);

    const foundOSs = res.stdout.split('\n').slice(3,-1) // get only the wsl items
      .map(str => removeNullBytes(str).split(' ').filter((subStr: string) => subStr.length > 0) // remove space and null bytes
        .slice(0,-2)) // remove status and final /r
      .sort((a,b) => b.length -a.length) // put the selected OS as first of the list (it has * in front)
      .map(distro => distro.slice(-1).pop()) // get only the name as string of the distro found (ex. [["*","Ubuntu"],["Fedora"]] => ["Ubuntu","Fedora"])
      .filter(distro => !EXCLUDED_WSL.includes(distro)); 

    setOsState({ loading: false, selectedOS: foundOSs[0], OSs: foundOSs });
    setTriggerSecondUseEffect(!triggerSecondUseEffect);
  };

  const checkUser = async () => {
    setUserState({ ...userState, loading: true });
    
    const res = await ddClient.docker.cli.exec('run', buildLSArguments(getPathValue()));

    if (res.stderr !== '' || res.stdout === '') {
      ddClient.desktopUI.toast.error(`Error while locating users: ${res.stderr} using /tmp as mount point`);
      setUserState({ loading: false, selectedUser: 'tmp', users: ['tmp'] });
      setMountPointUser('tmp');
    }
    const foundUsers = res.stdout.split('\n');
    foundUsers.pop();
    setUserState({ loading: false, selectedUser: foundUsers[0], users: foundUsers });
  };

  const locateMountPoint = async () => {
    if(ddClient.host.platform === 'win32'){
      checkWindowsDistro();
    }else{
      checkUser();
    }
  };

  useEffect(() => {
    const execChecks = async () => {
      if (userState.users.length === 0) {

        setHasLocalImage({ ...hasLocalImage, checking: true });

        const images = await ddClient.docker.listImages() as [DockerImage];
        const isPresent = images.some(image => image.RepoTags?.at(0) === LATEST_IMAGE);

        setHasLocalImage({ checking: false, isPresent });

        if (isPresent) {
          locateMountPoint();
        } else {
          setIsPullingImage(true);
        }
      }
    };

    execChecks();
  }, [triggerFirstUseEffect]);

  useEffect(() => {
    if(osState.selectedOS !== ''){
      checkUser();
    }
  },[triggerSecondUseEffect]);

  const onClose = () => {
    setMountPointUser(userState.selectedUser);
  };

  const endOfDownloadCallback = () => {
    setIsPullingImage(false);
    setTriggerFirstUseEffect(!triggerFirstUseEffect);
  };

  const handleOsChange = (target: string) => {
    setOsState({ ...osState, selectedOS: target});
    checkUser();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <Box >
          {
            osState.OSs.length > 0 &&
              <FormControl sx={{ minWidth: 120 }} size="small" variant='outlined'>
                <Select
                  value={osState.selectedOS || osState.OSs[0]}
                  onChange={({ target }) =>handleOsChange(target.value)}
                >
                  {osState.OSs.map(os => (
                    <MenuItem key={os} value={os}>{os}</MenuItem>
                  ))}
                </Select>
              </FormControl>
          }
          <Box marginBottom={5} display="flex" gap={5} alignItems="center">
            {hasLocalImage.checking &&
              <Typography>
                Checking for local LocalStack image
              </Typography>
            }
            {userState.loading &&
              <Typography>
                Checking for users
              </Typography>
            }
            {osState.loading &&
              <Typography>
                Checking for your wsl OS
              </Typography>
            }
            {isPullingImage &&
              <>
                <Typography>
                  Pulling localstack/localstack:latest... Please do not exit this view
                </Typography>
                <DownloadProgress callback={endOfDownloadCallback} />
              </>
            }
            {
              (hasLocalImage.checking || userState.loading || osState.loading) && <CircularProgress />
            }
            {
              userState.users.length > 0 &&
              <FormControl sx={{ minWidth: 120 }} size="small" variant='outlined'>
                <Select
                  value={userState.selectedUser || userState.users[0]}
                  onChange={({ target }) =>
                    setUserState({ loading: userState.loading, selectedUser: target.value, users: userState.users })}
                >
                  {userState.users.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          </Box>
          <Typography variant='h3' gutterBottom>
            Select where LocalStack will be mounted
          </Typography>
          <Typography variant='subtitle2'>
            {`For MacOS users it will be under /Users/${userState.selectedUser || 'loading...'}/.localstack-volume`}
          </Typography>
          <Typography variant='subtitle2' gutterBottom>
            {`For Linux/Windows users it will be under \
             /home/${userState.selectedUser || 'loading...'}/.localstack-volume`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={!userState.selectedUser || userState.selectedUser === ''}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog >
  );
};

