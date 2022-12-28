
import { Box, Button, FormControl, MenuItem, Select, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useMountPoint } from '../../../services/hooks';

type OnBoardingProps = {
  users: string[],
  loading: boolean,
};

export const OnBoarding = ({ users, loading }: OnBoardingProps): ReactElement => {
  const { setMountPointUser } = useMountPoint();
  const [selectedUser, setSelectedUser] = useState<string>();

  useEffect(() => {
    setSelectedUser(users[0]);
  }, [users]);

  return (
    <Box m={2} >
      {
        loading ?
          <Typography>Loading</Typography> :
          <>
            <Typography>
              In order to work LocalStack needs a mount point. Select user:
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120, border: 'none' }} size="small">
              <Select
                value={selectedUser || users[0]}
                onChange={({ target }) => setSelectedUser(target.value)}
              >
                {users.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
            </FormControl><Button onClick={() => setMountPointUser(selectedUser)}>Confirm</Button></>
      }
    </Box>
  );
};
