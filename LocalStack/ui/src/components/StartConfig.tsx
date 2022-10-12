import { Edit } from "@mui/icons-material";
import { Box, Card, IconButton, TextField } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useRunConfig } from "../service/hooks";
import { ConfigOptions } from "./ConfigOptions";

type Props = {
  id: string,
};

export const StartConfig = ({ id }: Props): ReactElement => {

  const { runConfig } = useRunConfig();
  const [editing, setEditing] = useState<boolean>(false);

  const config = runConfig.find(item => item.id === id);


  return (
    <Card>
      <Box p={2} display="flex" width='full' >
        <TextField fullWidth variant="outlined" disabled={!editing} value={config.name}/>
        <IconButton onClick={() => setEditing(!editing)} >
          <Edit />
        </IconButton>
      </Box>
      {editing &&
        <ConfigOptions config={config} />
      }
    </Card>
  );
};
