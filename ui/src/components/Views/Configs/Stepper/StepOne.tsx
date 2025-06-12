import { Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { StepTemplate, StepTemplateProps } from './StepTemplate';

type Props = Pick<StepTemplateProps, 'handleNext' | 'handleBack'>;

export const StepOne = ({ handleBack, handleNext }: Props): ReactElement => (
  <StepTemplate
    isFirstElement={false}
    handleBack={handleBack}
    handleNext={handleNext}
  >
    <Typography>
      In order to start the Pro container, add a configuration with the variable
      LOCALSTACK_AUTH_TOKEN set to your auth token and select that configuration
      in the top right corner. API Keys are also supported, but will be
      deprecated in the future.
    </Typography>
  </StepTemplate>
);
