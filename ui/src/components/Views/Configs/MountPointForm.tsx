import { ExecResult } from '@docker/extension-api-client-types/dist/v1';
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
import {
  getOSsFromBinary,
  getUsersFromBinaryUnix,
  getUsersFromBinaryWindows,
  useDDClient,
  useMountPoint,
} from '../../../services';
import { DownloadProgress } from '../../Feedback';

export const MountPointForm = (): ReactElement => {

  const [userState, setUserState] = useState({ loading: false, selectedUser: '', users: [] });
  const [osState, setOsState] = useState({ loading: false, selectedOS: '', OSs: [] });
  const [isPullingImage, setIsPullingImage] = useState(false);
  const [triggerFirstUseEffect, setTriggerFirstUseEffect] = useState(false);
  const [triggerSecondUseEffect, setTriggerSecondUseEffect] = useState(false);

  const { setMountPointData } = useMountPoint();
  const ddClient = useDDClient();

  const checkWindowsDistro = async () => {
    setOsState({ ...osState, loading: true });

    const res = await ddClient.extension.host?.cli.exec('checkWSLOS.cmd', []);

    const foundOSs = getOSsFromBinary(res.stdout);

    setOsState({ loading: false, selectedOS: foundOSs[0], OSs: foundOSs });
    setTriggerSecondUseEffect(!triggerSecondUseEffect);
  };

  const checkUser = async () => {
    setUserState({ ...userState, loading: true });

    let res: ExecResult;
    let foundUsers = [];
    if (ddClient.host.platform === 'win32') {
      res = await ddClient.extension.host?.cli.exec('checkUser.cmd', [osState.selectedOS]);
      foundUsers = getUsersFromBinaryWindows(res.stdout);
    } else {
      res = await ddClient.extension.host?.cli.exec('checkUser.sh', []);
      foundUsers = getUsersFromBinaryUnix(res.stdout);
    }

    if (res.stderr || !res.stdout) {
      ddClient.desktopUI.toast.error(`Error while locating users: ${res.stderr} using /tmp/.cache as mount point`);
      setUserState({ loading: false, selectedUser: '../tmp', users: ['tmp'] });
      setMountPointData('../tmp');
    }

    setUserState({ loading: false, selectedUser: foundUsers[0], users: foundUsers });
  };

  const locateMountPoint = async () => {
    if (ddClient.host.platform === 'win32') {
      checkWindowsDistro();
    } else {
      checkUser();
    }
  };

  useEffect(() => {
    const execChecks = async () => {
      if (userState.users.length === 0
        || (ddClient.host.platform === 'win32' && osState.OSs.length === 0)) {
        locateMountPoint();
      }
    };

    execChecks();
  }, [triggerFirstUseEffect]);

  useEffect(() => {
    if (osState.selectedOS) {
      checkUser();
    }
  }, [triggerSecondUseEffect]);

  const onClose = () => {
    setMountPointData(`${userState.selectedUser},${osState.selectedOS}`);
  };

  const endOfDownloadCallback = () => {
    setIsPullingImage(false);
    setTriggerFirstUseEffect(!triggerFirstUseEffect);
  };

  const handleOsChange = (target: string) => {
    setOsState({ ...osState, selectedOS: target });
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
                onChange={({ target }) => handleOsChange(target.value)}
              >
                {osState.OSs.map(os => (
                  <MenuItem key={os} value={os}>{os}</MenuItem>
                ))}
              </Select>
            </FormControl>
          }
          <Box marginBottom={5} display="flex" gap={5} alignItems="center">
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
                  Pulling localstack/localstack:latest
                </Typography>
                <DownloadProgress
                  imageName={LATEST_IMAGE}
                  callback={endOfDownloadCallback} />
              </>
            }
            {
              (userState.loading || osState.loading) && <CircularProgress />
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
          disabled={!userState.selectedUser}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog >
  );
};
