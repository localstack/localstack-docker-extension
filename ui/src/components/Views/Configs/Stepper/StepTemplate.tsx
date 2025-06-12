import { Box, Button } from '@mui/material';
import React, { ReactElement } from 'react';

export type StepTemplateProps = {
  children: ReactElement;
  isFirstElement: boolean;
  handleBack?: () => void;
  handleNext?: () => void;
  FinishActions?: ReactElement;
};

export const StepTemplate = ({
  children,
  isFirstElement,
  handleNext,
  handleBack,
  FinishActions,
}: StepTemplateProps): ReactElement => (
  <>
    <Box sx={{ margin: 5 }}>{children}</Box>
    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
      <Button disabled={isFirstElement} onClick={handleBack} sx={{ mr: 1 }}>
        Back
      </Button>
      <Box sx={{ flex: '1 1 auto' }} />
      {FinishActions ? (
        { FinishActions }
      ) : (
        <Button onClick={handleNext}>Next</Button>
      )}
      <Box />
    </Box>
  </>
);
