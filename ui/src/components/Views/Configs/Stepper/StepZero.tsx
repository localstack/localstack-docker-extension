import { Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { StepTemplate, StepTemplateProps } from './StepTemplate';

type Props = Pick<StepTemplateProps, 'handleNext'>;

export const StepZero = ({ handleNext }: Props): ReactElement => (
  <StepTemplate isFirstElement handleNext={handleNext}>
    <>
      <Typography>
        Make sure to have the option &quot;Show Docker Extensions system
        containers&quot; enabled. To enable it visit your settings:
      </Typography>
      <ul>
        <li>Navigate to Settings</li>
        <li>Select the Extensions tab</li>
        <li>
          Next to Show Docker Extensions system containers, select the checkbox
        </li>
        <li>In the bottom-right corner, select Apply & Restart</li>
      </ul>
    </>
  </StepTemplate>
);
