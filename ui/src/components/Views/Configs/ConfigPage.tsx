import { Add as AddIcon, Delete, Edit } from '@mui/icons-material';
import { Box, Button, ButtonGroup, IconButton, Theme } from '@mui/material';
import React, { ReactElement, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { v4 as uuid } from 'uuid';
import { useMountPoint, useRunConfig } from '../../../services/hooks';
import { UpsertConfig } from './UpsertConfig';
import { Optional, RunConfig } from '../../../types';
import { DEFAULT_CONFIGURATION_ID } from '../../../constants';
import { ConfirmableButton } from '../../Feedback/ConfirmableButton';

const useStyles = makeStyles((theme: Theme) => createStyles({
  addButton: {
    marginBottom: theme.spacing(2),
  },
}));

export const ConfigPage = (): ReactElement => {

  const { runConfig, deleteConfig } = useRunConfig();
  const { setMountPointUser } = useMountPoint();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [targetConfig, setTargetConfig] = useState<RunConfig | null>(null);

  const classes = useStyles();

  const openModalSetup = (config?: Optional<RunConfig>) => {
    setTargetConfig(config);
    setOpenModal(true);
  };

  const columns: GridColDef<RunConfig>[] = [
    {
      field: 'Actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) =>
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          <IconButton disabled={params.row.id === DEFAULT_CONFIGURATION_ID} onClick={() => openModalSetup(params.row)} >
            <Edit fontSize='small' />
          </IconButton>
          <ConfirmableButton
            component="IconButton"
            disabled={params.row.id === DEFAULT_CONFIGURATION_ID}
            title={`Delete ${params.row.name} configuration?`}
            okText="Delete"
            onClick={() => deleteConfig(params.row.id)}
            text="Selected configuration will be permanently deleted"
          >
            <Delete fontSize='small' />
          </ConfirmableButton>
        </>,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
    },
    {
      field: 'id',
      headerName: 'ID',
      flex: 2,
    },
    {
      field: 'Configurations',
      headerName: 'Configurations',
      sortable: false,
      flex: 5,
      renderCell: (params: GridRenderCellParams) =>
        (params.row as RunConfig).vars.map(setting => `${setting.variable}=${setting.value}`).join(', '),
    },
  ];
  return (
    <Box m={2}>
      <ButtonGroup className={classes.addButton}>
        <Button
          endIcon={<AddIcon />}
          variant='contained'
          onClick={() => openModalSetup()}
        >
          New
        </Button>
        <Button onClick={() => setMountPointUser('')}>
          Change mount point
        </Button>
      </ButtonGroup>
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
