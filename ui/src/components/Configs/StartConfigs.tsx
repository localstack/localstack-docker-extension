import { Add as AddIcon, Edit } from '@mui/icons-material';
import { Box, Button, IconButton, Theme } from '@mui/material';
import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { v4 as uuid } from 'uuid';
import { useRunConfig } from '../../services/hooks';
import { UpsertConfig } from './UpsertConfig';
import { Optional, RunConfig } from '../../types';
import { DEFAULT_CONFIGURATION_ID } from '../../constants';

const useStyles = makeStyles((theme: Theme) => createStyles({
  addButton: {
    margin: theme.spacing(2),
  },
}));

export const StartConfigs = (): ReactElement => {

  const { runConfig } = useRunConfig();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [targetConfig, setTargetConfig] = useState<RunConfig | null>(null);

  const classes = useStyles();

  const openModalSetup = (config?: Optional<RunConfig>) => {
    setTargetConfig(config);
    setOpenModal(true);
  };

  const columns: GridColDef<RunConfig>[] = [
    {
      field: 'Edit',
      headerName: 'Edit',
      width: 50,
      renderCell: (params: GridRenderCellParams) =>
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {params.row.id !== DEFAULT_CONFIGURATION_ID &&
            <IconButton onClick={() => openModalSetup(params.row)} >
              <Edit />
            </IconButton>
          }
        </>,
    },
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'id',
      headerName: 'ID',
      width: 300,
    },
    {
      field: 'Configurations',
      headerName: 'Configurations',
      sortable: false,
      width: 900,
      renderCell: (params: GridRenderCellParams) =>
        (params.row as RunConfig).vars.map(setting => `${setting.variable}=${setting.value}`).join(', '),
    },
  ];
  return (
    <Box m={2}>
      <Button
        className={classes.addButton}
        endIcon={<AddIcon />}
        variant='contained'
        onClick={() => openModalSetup()}
      >
        New
      </Button>
      <Box sx={{ marginTop: 3 }}>
        <DataGrid
          autoHeight
          rows={runConfig} columns={columns}
          getRowId={(row) => (row).id as string || uuid()}
          disableSelectionOnClick
        />
      </Box>
      {openModal && <UpsertConfig config={targetConfig} open={openModal} onClose={() => setOpenModal(false)} />}
    </Box >
  );
};
