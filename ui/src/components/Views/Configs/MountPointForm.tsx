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
import { LATEST_IMAGE } from '../../../constants';
import { useDDClient, useMountPoint } from '../../../services/hooks';
import { DockerImage } from '../../../types';
import { DownloadProgress } from '../../DownloadProgress/DownloadProgress';

export const MountPointForm = (): ReactElement => {
  const [userState, setUserState] = useState({ loading: false, selectedUser: '', users: [] });
  const [hasLocalImage, setHasLocalImage] = useState({ checking: true, isPresent: false });
  const [isPullingImage, setIsPullingImage] = useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = useState(false);

  const { setMountPointUser } = useMountPoint();
  const ddClient = useDDClient();

  const checkHomeDir = async () => {
    setUserState({ loading: true, selectedUser: userState.selectedUser, users: userState.users });
    const path = ddClient.host.platform === 'darwin' ? 'Users' : 'home';
    const res = await ddClient.docker.cli.exec('run',
      ['--rm', '--entrypoint=', '-v', `/${path}:/users`, 'localstack/localstack', 'ls', '/users']);

    if (res.stderr !== '' || res.stdout === '') {
      ddClient.desktopUI.toast.error(`Error while locating users: ${res.stderr}\n using /tmp as mount point`);
      setUserState({ loading: false, selectedUser: 'tmp', users: ['tmp'] });
      setMountPointUser('tmp');
    }
    const foundUsers = res.stdout.split('\n');
    foundUsers.pop(); // remove last '' element
    setUserState({ loading: false, selectedUser: foundUsers[0], users: foundUsers });
  };

  useEffect(() => {
    const execChecks = async () => {
      if (userState.users.length === 0) {

        setHasLocalImage({ ...hasLocalImage, checking: true });

        const images = await ddClient.docker.listImages() as [DockerImage];
        const isPresent = images.some(image => image.RepoTags?.at(0) === LATEST_IMAGE);

        setHasLocalImage({ checking: false, isPresent });

        if (isPresent) {
          checkHomeDir();
        } else {
          setIsPullingImage(true);
        }
      }
    };

    execChecks();
  }, [triggerUseEffect]);

  const onClose = () => {
    setMountPointUser(userState.selectedUser);
  };

  const endOfDownloadCallback = () => {
    setIsPullingImage(false);
    setTriggerUseEffect(!triggerUseEffect);
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <Box >
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
            {isPullingImage &&
              <>
                <Typography>
                  Pulling localstack/localstack:latest
                </Typography>
                <DownloadProgress
                  callback={endOfDownloadCallback} />
              </>
            }
            {
              (hasLocalImage.checking || userState.loading) && <CircularProgress />
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
            {`For MacOS users it will be under /Users/${userState.selectedUser || 'loading...'} \
            /.cache/localstack/volume`}
          </Typography>
          <Typography variant='subtitle2' gutterBottom>
            {`For Linux/Windows users it will be under \
             /home/${userState.selectedUser || 'loading...'}/.cache/localstack/volume`}
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
