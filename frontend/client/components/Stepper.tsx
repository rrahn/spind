import React, { Fragment } from 'react/jsx-runtime';
import './Stepper.css'

interface StepperProps {
  currentStep: number;
  totalSteps: number;
};

function Step(step: number, activeStep: number, isFirstStep: boolean = false) {
  let circleClass = step < activeStep ? "stepper--circle stepper--circle__passed" : "stepper--circle";
  circleClass = step === activeStep ? "stepper--circle stepper--circle__active" : circleClass;

  const lineClass = step <= activeStep ? "stepper--line stepper--line__passed" : "stepper--line";

  return (
    <Fragment>
      {!isFirstStep && <span id={step.toString()} className={lineClass}></span>}
      <div id={step.toString()} className={circleClass}></div>
    </Fragment>
  )
}

export default function Stepper({currentStep, totalSteps}: StepperProps) {

  const Steps = Array.from({length: totalSteps}, (_, i) => {
    return Step(i, currentStep, i === 0);
  });

  return (
    <div className="stepper--wrapper">
      {...Steps}
    </div>
  );
}
