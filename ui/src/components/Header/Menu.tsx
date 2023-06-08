import React, { useEffect, useState } from 'react';
import { MoreVert } from '@mui/icons-material';
import { IconButton, Menu, Typography } from '@mui/material';
import { removeRepoFromImage, useDDClient } from '../../services';
import { DockerImage } from '../../types';
import { ConfirmableButton } from '../Feedback';
import { UpdateDialog } from '../Views';

const ITEM_HEIGHT = 80;

const IMAGE_PREFIXES = [
  'localstack/',
  'lambci/lambda:',
  'mlupin/docker-lambda:',
  'public.ecr.aws/lambda',
];


export const LongMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>(['Loading...']);
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

    const fetchImages = async () => {
      const images = (await ddClient.docker.listImages()) as DockerImage[];

      const localstackImages = images.filter(image =>
        IMAGE_PREFIXES.some(prefix => image.RepoTags?.at(0).startsWith(prefix))); 

      const imagesWithoutOrgName = localstackImages.map(image => removeRepoFromImage(image.RepoTags?.at(0)));
      setImages(imagesWithoutOrgName);
    };

    fetchImages();
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
          onClick={handleUpdateClick}
          text={
            <>
              Following images will be updated:
              <Typography style={{ fontWeight: 600 }}>
                {images.join(', ')}
              </Typography>
            </>
          }
        >
          Update Images
        </ConfirmableButton>

      </Menu>
    </div>
  );
};
