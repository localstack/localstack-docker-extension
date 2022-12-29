
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { LOCALSTACK_IMAGES } from '../../constants';
import { useDDClient, useMountPoint } from '../../services/hooks';
import { DockerImage } from '../../types';


export const OnBoarding = (): ReactElement => {
  const { setMountPointUser } = useMountPoint();
  const ddClient = useDDClient();
  const [userState, setUserState] = useState({ loading: false, selectedUser: '', users: [] });
  const [hasLocalImage, setHasLocalImage] = useState({ checking: true, isPresent: false });
  const [isPullingImage, setIsPullingImage] = useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = useState(false);

  const checkHomeDir = async () => {
    setUserState({ loading: true, selectedUser: userState.selectedUser, users: userState.users });
    const path = ddClient.host.platform === 'darwin' ? 'Users' : 'home';
    const res = await ddClient.docker.cli.exec('run',
      ['--entrypoint=', '-v', `/${path}:/users`, 'localstack/localstack', 'ls', '/users']);

    const foundUsers = res.stdout.split('\n');
    foundUsers.pop(); // remove last '' element
    setUserState({ loading: false, selectedUser: foundUsers[0], users: foundUsers });
  };

  const checkLocalImage = async () => {
    setHasLocalImage({ checking: true, isPresent: hasLocalImage.isPresent });
    const images = await ddClient.docker.listImages() as [DockerImage];
    const isPresent = images.filter(image => LOCALSTACK_IMAGES.includes(image.RepoTags?.at(0).split(':').at(0)));
    setHasLocalImage({ checking: false, isPresent: isPresent.length > 0 });
    return isPresent;
  };

  useEffect(() => {
    const execChecks = async () => {
      if (userState.users.length === 0) {
        const isImagePresent = await checkLocalImage();
        if (isImagePresent) {
          checkHomeDir();
        } else {
          setIsPullingImage(true);
          ddClient.docker.cli.exec('pull', ['localstack/localstack'], {
            stream: {
              onOutput(data): void {
                console.log(data.stderr ? data.stderr : data.stdout);
              },
              onClose() {
                setIsPullingImage(false);
                setTriggerUseEffect(!triggerUseEffect);
              },
              splitOutputLines: true,
            },
          });
        }

      }
    };

    execChecks();
  }, [userState.users, triggerUseEffect]);

  return (
    <Dialog open>
      <DialogContent>
        <Box >
          <Typography variant='h3' gutterBottom>
            Select where LocalStack will be mounted
          </Typography>
          <Typography variant='subtitle2'>
            {'For MacOS users it will be under /Users/<Selected>/.localstack-volume'}
          </Typography>
          <Typography variant='subtitle2' gutterBottom>
            {'For Linux/Windows users it will be under /home/<Selected>/.localstack-volume'}
          </Typography>
          <Box marginTop={5}>
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
              <Typography>
                Pulling localstack/localstack:latest... Please do not exit this view
              </Typography>
            }
            {(hasLocalImage.checking || userState.loading || isPullingImage) && <Skeleton animation="wave" />
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setMountPointUser(userState.selectedUser)}
          disabled={!userState.selectedUser || userState.selectedUser === ''}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog >
  );
};
