
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
} from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDDClient, useMountPoint } from '../../services/hooks';


export const OnBoarding = (): ReactElement => {
  const { setMountPointUser } = useMountPoint();
  const ddClient = useDDClient();
  const [state, setState] = useState({ loading: true, selectedUser: '', users: [] });


  useEffect(() => {
    const checkHomeDir = async () => {
      const path = ddClient.host.platform === 'darwin' ? 'Users' : 'home';
      const res = await ddClient.docker.cli.exec('run',
        ['--entrypoint=', '-v', `/${path}:/users`, 'localstack/localstack', 'ls', '/users']);

      const foundUsers = res.stdout.split('\n');
      foundUsers.pop(); // remove last '' element
      setState({ loading: false, selectedUser: foundUsers[0], users: foundUsers });
    };

    checkHomeDir();
  }, [state.users]);

  return (
    <Dialog open>
      <DialogContent>
        <Box m={2} width={500} height={400}>
          {state.loading ? <CircularProgress /> :
            <FormControl sx={{ m: 1, minWidth: 120, border: 'none' }} size="small">
              <Select
                value={state.selectedUser || state.users[0]}
                onChange={({ target }) =>
                  setState({ loading: state.loading, selectedUser: target.value, users: state.users })}
              >
                {state.users.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
            </FormControl>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMountPointUser(state.selectedUser)}>Confirm</Button>
      </DialogActions>
    </Dialog >
  );
};
