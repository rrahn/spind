import { MouseEvent, useContext } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import { StepperDispatchContext } from "../contexts/StepperContext";

export default function FormPagePayment() {
  const navigate = useNavigate();
  const dispatchStepper = useContext(StepperDispatchContext);

  const handleClickPrevPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'prev' });
    }
    navigate('/summary');
  }

  return (
    <div>
      <p>Here comes the page where the payment is done using stripe </p>
      <FormPageNavigation onPrev={handleClickPrevPage}/>
    </div>
  );
}
