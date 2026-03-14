import { Stepper, Step, StepLabel, StepButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { label: 'Annexure-1', sublabel: 'Immovable Property', path: 'annexure1' },
  { label: 'Annexure-2', sublabel: 'Movable Property', path: 'annexure2' },
  { label: 'Liabilities', sublabel: 'Section C', path: 'liabilities' },
  { label: 'Guarantors', sublabel: 'Guarantor Details', path: 'guarantors' },
  { label: 'Summary', sublabel: 'Net Worth', path: 'summary' },
];

interface CertificateStepperProps {
  certificateId: string;
  activeStep: number;
}

export const CertificateStepper = ({ certificateId, activeStep }: CertificateStepperProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((step, index) => (
          <Step key={step.label} completed={index < activeStep}>
            <StepButton onClick={() => navigate(`/certificates/${certificateId}/${step.path}`)}>
              <StepLabel optional={<span style={{ fontSize: 11 }}>{step.sublabel}</span>}>
                {step.label}
              </StepLabel>
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
