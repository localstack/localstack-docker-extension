import React, { useState, ReactElement, ReactNode, FunctionComponent, MouseEvent } from 'react';

import {
  Button,
  IconButton,
  ButtonProps,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

const COMPONENTS_MAP = {
  Button,
  IconButton,
  MenuItem,
  fallback: Button,
};

export type BaseProps = {
  title: string;
  text?: string | JSX.Element;
  okText?: string;
  okColor?: ButtonProps['color'];
  cancelColor?: ButtonProps['color'];
  cancelText?: string;
  children?: ReactNode;
}

type ComponentButton = (ButtonProps & { component: 'Button' }) & BaseProps
type ComponentIconButton = (ButtonProps & { component: 'IconButton' }) & BaseProps
type ComponentMenuItem = (ButtonProps & { component: 'MenuItem' }) & BaseProps

export type ConfirmableButtonProps =
  ComponentButton | ComponentIconButton | ComponentMenuItem;

export const ConfirmableButton = ({
  title,
  text,
  component = 'Button',
  okText,
  okColor,
  cancelColor,
  cancelText,
  children,
  ...rest
}: ConfirmableButtonProps): ReactElement => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // eslint-disable-next-line
  const Component: FunctionComponent<any> = COMPONENTS_MAP[component] || COMPONENTS_MAP.fallback;

  return (
    <>
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>{title}</DialogTitle>
        {text && (
          <DialogContent>
            {typeof text === 'string' ? (
              <DialogContentText>{text}</DialogContentText>
            ) : (
              text
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button
            color= {cancelColor || 'primary'}
            variant='outlined'
            onClick={() => setShowConfirmDialog(false)}
          >
            {cancelText || 'Cancel'}
          </Button>
          <Button
            autoFocus
            color= {okColor || 'error'}
            variant='contained'
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              if (rest.onClick) rest.onClick(event as any); // eslint-disable-line
              setShowConfirmDialog(false);
            }}
          >
            {okText || 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
      <Component {...rest} onClick={() => setShowConfirmDialog(true)}>
        {children}
      </Component>
    </>
  );
};
