import Stepper from "../components/Stepper";
import { StepperContext } from "../contexts/StepperContext";
import React, { useContext } from "react";

export default function FormPageStatusBar() {

  const stepState = useContext(StepperContext);

  return (
    <div>
      <Stepper currentStep={stepState.step} totalSteps={4}/>
    </div>
  );
}
