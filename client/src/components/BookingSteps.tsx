import { ReactNode } from 'react';

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

interface StepProps {
  number: 1 | 2 | 3;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
  isLast?: boolean;
}

function Step({ number, title, isActive, isCompleted, onClick, isLast = false }: StepProps) {
  return (
    <div className="flex-1 relative">
      <div className={`h-1 ${isActive || isCompleted ? 'bg-primary' : 'bg-neutral-300'}`}></div>
      <div 
        className={`
          absolute top-0 ${number === 2 ? 'left-1/2' : number === 3 ? 'right-0' : '-ml-2'} 
          ${number === 2 ? '-ml-2' : ''} -mt-3 
          flex items-center justify-center h-7 w-7 rounded-full 
          ${isActive || isCompleted ? 'bg-primary' : 'bg-neutral-300'} 
          text-white text-sm font-medium cursor-pointer
        `}
        onClick={onClick}
      >
        {number}
      </div>
      {onClick && (
        <div 
          className={`
            absolute top-8 ${number === 2 ? 'left-1/2 -translate-x-1/2' : number === 3 ? 'right-0' : 'left-0'} 
            text-xs font-medium ${isActive ? 'text-primary' : 'text-neutral-500'}
          `}
        >
          {title}
        </div>
      )}
    </div>
  );
}

export default function BookingSteps({ currentStep, onStepClick }: BookingStepsProps) {
  const handleStepClick = (step: 1 | 2 | 3) => {
    if (onStepClick && step <= currentStep) {
      onStepClick(step);
    }
  };

  return (
    <div className="flex items-center justify-between mb-8 pt-8">
      <Step 
        number={1} 
        title="Select Service" 
        isActive={currentStep === 1} 
        isCompleted={currentStep > 1} 
        onClick={onStepClick ? () => handleStepClick(1) : undefined}
      />
      <Step 
        number={2} 
        title="Select Staff & Date" 
        isActive={currentStep === 2} 
        isCompleted={currentStep > 2} 
        onClick={onStepClick ? () => handleStepClick(2) : undefined}
      />
      <Step 
        number={3} 
        title="Confirm" 
        isActive={currentStep === 3} 
        isCompleted={false} 
        isLast={true}
        onClick={onStepClick ? () => handleStepClick(3) : undefined}
      />
    </div>
  );
}
