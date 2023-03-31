import { ExecResult } from '@docker/extension-api-client-types/dist/v1';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  getOSsFromBinary,
  getUsersFromBinaryUnix,
  getUsersFromBinaryWindows,
  useDDClient,
  useMountPoint,
} from '../../../services';
import { ConfirmableButton } from '../../Feedback';

const ShrinkedCircularProgress = (): ReactElement => <CircularProgress size={20} sx={{ margin: 1 }} />;

interface MountPointFormProps {
  initialState: number;
}

export const SettingsForm = ({ initialState }: MountPointFormProps): ReactElement => {

  const [userState, setUserState] = useState({ loading: false, selectedUser: '', users: [] });
  const [osState, setOsState] = useState({ loading: false, selectedOS: '', OSs: [] });
  const [triggerUserCheck, setTriggerUserCheck] = useState(false);
  const [activeStep, setActiveStep] = useState(initialState);

  const { setMountPointData } = useMountPoint();
  const ddClient = useDDClient();


  const steps = ['Enable Docker Desktop option', 'Set mount point'];

  const handleNext = () => {
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getMountPointPath = (): string => {
    if (ddClient.host.platform === 'darwin') {
      return `/Users/${userState.selectedUser || 'loading...'}/Library/Caches/localstack/volume`;
    }
    return `/home/${userState.selectedUser || 'loading...'}/.cache/localstack/volume`;
  };

  const checkWindowsDistro = async () => {
    setOsState({ ...osState, loading: true });

    const res = await ddClient.extension.host?.cli.exec('checkWSLOS.cmd', []);

    const foundOSs = getOSsFromBinary(res.stdout);

    setOsState({ loading: false, selectedOS: foundOSs[0], OSs: foundOSs });
    setTriggerUserCheck(!triggerUserCheck);
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
      ddClient.desktopUI.toast.error(`Error while locating users: ${res.stderr} using /tmp as mount point`);
      closeWithoutSetting();
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
  }, []);

  useEffect(() => {
    if (osState.selectedOS) {
      checkUser();
    }
  }, [triggerUserCheck]);

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

  const onClose = () => {
    ddClient.desktopUI.toast.warning('Complete the setup first');
  };

  const handleOsChange = (target: string) => {
    setOsState({ ...osState, selectedOS: target });
    checkUser();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ),
          )}
        </Stepper>
        <Box sx={{ margin: 5 }}>
          {activeStep === 0 ?
            <>
              <Typography>
                Make sure to have the option &quot;Show Docker Extensions system containers&quot; enabled.
                To enable it visit your settings:
              </Typography>
              <ul>
                <li>Navigate to Settings</li>
                <li>Select the Extensions tab</li>
                <li>Next to Show Docker Extensions system containers, select the checkbox</li>
                <li>In the bottom-right corner, select Apply & Restart</li>
              </ul>
            </>
            :
            <>
              <Typography variant='h3'>
                Default mount point settings
              </Typography><br /><Paper sx={{ padding: 1 }}>
                {ddClient.host.platform === 'win32' &&
                  <>
                    <Typography variant='subtitle1'>
                      WSL distro
                    </Typography>
                    <Typography variant='body2'>
                      Select in which WSL distro you want to mount the container
                    </Typography>
                    {osState.loading ?
                      <ShrinkedCircularProgress />
                      :
                      <FormControl sx={{ minWidth: 120 }} size='small' variant='outlined'>
                        <Select
                          value={osState.selectedOS || osState.OSs[0]}
                          onChange={({ target }) => handleOsChange(target.value)}
                        >
                          {osState.OSs.map(os => (
                            <MenuItem key={os} value={os}>{os}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>}
                    <Divider />
                  </>}
                <>
                  <Typography variant='subtitle1'>
                    User
                  </Typography>
                  <Typography variant='body2'>
                    Select under which user you want to mount the container
                  </Typography>
                  {userState.loading || osState.loading ?
                    <ShrinkedCircularProgress />
                    :
                    <FormControl sx={{ minWidth: 120 }} size='small' variant='outlined'>
                      <Select
                        value={userState.selectedUser || userState.users[0]}
                        onChange={({ target }) => setUserState({
                          loading: userState.loading,
                          selectedUser: target.value,
                          users: userState.users,
                        })}
                      >
                        {userState.users.map(user => (
                          <MenuItem key={user} value={user}>{user}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>}
                </>
              </Paper><br /><Typography variant='body1'>
                {`The LocalStack container will be mounted under ${getMountPointPath()}`}
              </Typography><Typography variant='caption' display='block' gutterBottom>
                *You can still change this by overriding the LOCALSTACK_VOLUME_DIR environment variable
              </Typography></>
          }
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {
            activeStep === steps.length - 1 ?
              <>
                <ConfirmableButton
                  component='Button'
                  title='Close without setting mount point'
                  okText='Close'
                  okColor='error'
                  cancelColor='primary'
                  sx={{ marginRight: 1 }}
                  onClick={closeWithoutSetting}
                  text="Are you sure you want to close without setting a default mount point?
                        You'll need to use a configuration where LOCALSTACK_VOLUME_DIR is set-up otherwise
                        the LocalStack container will be mounted under /tmp and some features will not work!"
                >
                  Close
                </ConfirmableButton>
                <Button onClick={saveAndClose}>
                  Confirm
                </Button>
              </>
              :
              <Button onClick={handleNext}>
                Next
              </Button>
          }
          <Box />
        </Box>
      </DialogContent>
    </Dialog >
  );
};
