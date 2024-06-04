import { MouseEvent, useContext } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import FloorPlanCarousel from "../components/FloorPlanCarousel";
import { StepperDispatchContext } from "../contexts/StepperContext";

export default function FormPageContact() {

  const navigate = useNavigate();
  const dispatchStepper = useContext(StepperDispatchContext);

  const handleClickNextPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'next' });
    }
    navigate('/summary');
  }

  const handleClickPrevPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'prev' });
    }
    navigate('/contact');
  }

  return (
    <div>
      <FloorPlanCarousel/>
      <FormPageNavigation onPrev={handleClickPrevPage} onNext={handleClickNextPage}/>
    </div>
  );
}
