import { MoreVert } from '@mui/icons-material';
import { IconButton, Menu } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDDClient } from '../../../services/hooks';
import { DockerImage } from '../../../types';
import { ConfirmableButton } from '../Configs/ConfirmableButton';
import { UpdateDialog } from '../Dialog/UpdateDialog';

const ITEM_HEIGHT = 80;

export const LongMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [images, setImages] = useState<string>('Loading...');
  const ddClient = useDDClient();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateClick = () => {
    handleClose();
    setOpenModal(true);
  };

  useEffect(() => {
    setImages('a');
    (Promise.resolve(ddClient.docker.listImages()) as Promise<[DockerImage]>).then(images =>
      setImages(images.filter(image => image.RepoTags?.at(0).startsWith('localstack/'))
        .map(image => image.RepoTags?.at(0).split('localstack/').at(-1)).join(', ')));
  }, []);

  return (
    <div>
      {openModal && <UpdateDialog open={openModal} onClose={() => setOpenModal(false)} />}
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        <ConfirmableButton
          component='MenuItem'
          title='Update LocalStack Images?'
          okText='Update'
          okColor='primary'
          cancelColor='error'
          onClick={() => handleUpdateClick()}
          text={`Following images will be updated: ${images}`}
        >
          Update Images
        </ConfirmableButton>

      </Menu>
    </div>
  );
};
