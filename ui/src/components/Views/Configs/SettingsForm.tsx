import { Dialog, DialogContent, Step, StepLabel, Stepper } from '@mui/material';
import React, { ReactElement, useState } from 'react';
import { useDDClient } from '../../../services';
import { StepZero, StepOne, StepTwo } from './Stepper';

interface MountPointFormProps {
  initialState: number;
}

export const SettingsForm = ({
  initialState,
}: MountPointFormProps): ReactElement => {
  const [activeStep, setActiveStep] = useState(initialState);

  const { client: ddClient } = useDDClient();

  const steps = [
    'Enable Docker Desktop option',
    'Launching pro container',
    'Set mount point',
  ];

  const handleNext = () => {
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onClose = () => {
    ddClient.desktopUI.toast.warning('Complete the setup first');
  };

  const stepsList = [
    <StepZero handleNext={handleNext} />,
    <StepOne handleNext={handleNext} handleBack={handleBack} />,
    <StepTwo handleBack={handleBack} />,
  ];

  return (
    <Dialog open onClose={onClose}>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {stepsList[activeStep]}
      </DialogContent>
    </Dialog>
  );
};
