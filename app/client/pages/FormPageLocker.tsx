import React, { useContext } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import FloorPlanCarousel from "../components/FloorPlanCarousel";
import { StepperDispatchContext } from "../contexts/StepperContext";
import { LockerSelectionContext } from "../contexts/LockerSelectionContext";

export default function FormPageContact() {

  const navigate = useNavigate();
  const dispatchStepper = useContext(StepperDispatchContext);
  const selectedLocker = useContext(LockerSelectionContext);

  const handleClickNextPage = () => {

    // If the user has not selected a locker, do not allow them to proceed
    // instead inform them that they need to select a locker first.
    if (selectedLocker === undefined || selectedLocker.locker === 0) {
      alert('Please select a locker first');
      return;
    }

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
