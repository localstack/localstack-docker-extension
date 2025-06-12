import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { ExecResult } from '@docker/extension-api-client-types/dist/v1';
import { MAC_OS, WIN_OS } from '../../../../constants';
import {
  getOSsFromBinary,
  getUsersFromBinaryUnix,
  getUsersFromBinaryWindows,
  useDDClient,
  useMountPoint,
} from '../../../../services';
import { StepTemplate, StepTemplateProps } from './StepTemplate';
import { ConfirmableButton } from '../../../Feedback';

const ShrunkCircularProgress = (): ReactElement => (
  <CircularProgress size={20} sx={{ margin: 1 }} />
);

type Props = Pick<StepTemplateProps, 'handleBack'>;
export const StepTwo = ({ handleBack }: Props): ReactElement => {
  const [userState, setUserState] = useState({
    loading: false,
    selectedUser: '',
    users: [],
  });
  const [osState, setOsState] = useState({
    loading: false,
    selectedOS: '',
    OSs: [],
  });
  const [triggerUserCheck, setTriggerUserCheck] = useState(false);

  const { client: ddClient } = useDDClient();
  const { setMountPointData, user, os } = useMountPoint();

  const saveAndClose = () => {
    setMountPointData({
      user: userState.selectedUser,
      os: osState.selectedOS,
      showForm: false,
      showSetupWarning: false,
      hasSkippedConfiguration: false,
    });
  };

  const closeWithoutSetting = () => {
    setMountPointData({
      user: userState.selectedUser,
      os: osState.selectedOS,
      showForm: false,
      showSetupWarning: false,
      hasSkippedConfiguration: true,
    });
  };
  const getMountPointPath = (): string => {
    if (ddClient.host.platform === MAC_OS) {
      return `/Users/${
        userState.selectedUser || 'loading...'
      }/Library/Caches/localstack/volume`;
    }
    return `/home/${
      userState.selectedUser || 'loading...'
    }/.cache/localstack/volume`;
  };

  const checkUser = async () => {
    setUserState({ ...userState, loading: true });

    let res: ExecResult;
    let foundUsers = [];
    if (ddClient.host.platform === WIN_OS) {
      res = await ddClient.extension.host?.cli.exec('checkUser.cmd', [
        osState.selectedOS,
      ]);
      foundUsers = getUsersFromBinaryWindows(res.stdout);
    } else {
      res = await ddClient.extension.host?.cli.exec('checkUser.sh', []);
      foundUsers = getUsersFromBinaryUnix(res.stdout);
    }

    if (res.stderr || !res.stdout) {
      ddClient.desktopUI.toast.error(
        `Error while locating users: ${res.stderr} using /tmp as mount point`,
      );
      closeWithoutSetting();
    }

    setUserState({
      loading: false,
      selectedUser: user || foundUsers[0],
      users: foundUsers,
    });
  };

  const checkWindowsDistro = async () => {
    setOsState({ ...osState, loading: true });

    const res = await ddClient.extension.host?.cli.exec('checkWSLOS.cmd', []);

    const foundOSs = getOSsFromBinary(res.stdout);

    setOsState({
      loading: false,
      selectedOS: os || foundOSs[0],
      OSs: foundOSs,
    });
    setTriggerUserCheck(true);
  };

  const locateMountPoint = async () => {
    if (ddClient.host.platform === WIN_OS) {
      checkWindowsDistro();
    } else {
      checkUser();
    }
  };
  useEffect(() => {
    const execChecks = async () => {
      if (
        userState.users.length === 0 ||
        (ddClient.host.platform === WIN_OS && osState.OSs.length === 0)
      ) {
        locateMountPoint();
      }
    };

    execChecks();
  }, []);

  useEffect(() => {
    if (osState.selectedOS) {
      checkUser();
    }
  }, [triggerUserCheck]);

  const handleOsChange = (target: string) => {
    setOsState({ ...osState, selectedOS: target });
    checkUser();
  };

  return (
    <StepTemplate
      isFirstElement={false}
      handleBack={handleBack}
      FinishActions={
        <>
          <ConfirmableButton
            component="Button"
            title="Close without setting mount point"
            okText="Close"
            okColor="error"
            cancelColor="primary"
            sx={{ marginRight: 1 }}
            onClick={closeWithoutSetting}
            text="Are you sure you want to close without setting a default mount point?
                        You'll need to use a configuration where LOCALSTACK_VOLUME_DIR is set-up otherwise
                        the LocalStack container will be mounted under /tmp and some features will not work!"
          >
            Close
          </ConfirmableButton>
          <Button onClick={saveAndClose}>Confirm</Button>
        </>
      }
    >
      <>
        <Typography variant="h3">Default mount point settings</Typography>
        <br />
        <Paper sx={{ padding: 1 }}>
          {ddClient.host.platform === WIN_OS && (
            <>
              <Typography variant="subtitle1">WSL distro</Typography>
              <Typography variant="body2">
                Select in which WSL distro you want to mount the container
              </Typography>
              {osState.loading ? (
                <ShrunkCircularProgress />
              ) : (
                <FormControl
                  sx={{ minWidth: 120 }}
                  size="small"
                  variant="outlined"
                >
                  <Select
                    value={osState.selectedOS || osState.OSs[0]}
                    onChange={({ target }) => handleOsChange(target.value)}
                  >
                    {osState.OSs.map((os) => (
                      <MenuItem key={os} value={os}>
                        {os}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Divider />
            </>
          )}
          <>
            <Typography variant="subtitle1">User</Typography>
            <Typography variant="body2">
              Select under which user you want to mount the container
            </Typography>
            {userState.loading || osState.loading ? (
              <ShrunkCircularProgress />
            ) : (
              <FormControl
                sx={{ minWidth: 120 }}
                size="small"
                variant="outlined"
              >
                <Select
                  value={userState.selectedUser || userState.users[0]}
                  onChange={({ target }) =>
                    setUserState({
                      loading: userState.loading,
                      selectedUser: target.value,
                      users: userState.users,
                    })
                  }
                >
                  {userState.users.map((user) => (
                    <MenuItem key={user} value={user}>
                      {user}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        </Paper>
        <br />
        <Typography variant="body1">
          {`The LocalStack container will be mounted under ${getMountPointPath()}`}
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          *You can still change this by overriding the LOCALSTACK_VOLUME_DIR
          environment variable
        </Typography>
      </>
    </StepTemplate>
  );
};
