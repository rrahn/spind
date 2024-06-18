import React, { useContext, useEffect, useState } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import FloorPlanCarousel  from "../components/FloorPlanCarousel";
import { StepperDispatchContext } from "../contexts/StepperContext";
import { LockerSelectionContext, LockerSelectionDispatchContext } from "../contexts/LockerSelectionContext";

export default function FormPageContact() {

  const navigate = useNavigate();
  const dispatchStepper = useContext(StepperDispatchContext);
  const selectedLocker = useContext(LockerSelectionContext);
  const dispatchLocker = useContext(LockerSelectionDispatchContext);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleClickNextPage = () => {

    // If the user has not selected a locker, do not allow them to proceed
    // instead inform them that they need to select a locker first.
    if (selectedLocker === undefined || selectedLocker.locker === 0) {
      setErrorMsg('Bitte wählen Sie zuerst ein Schließfach aus.');
      return;
    } else {
      setErrorMsg('');
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

  useEffect(() => {
    if (selectedLocker) {
      const timeout = setTimeout(() => {
        alert('Your reservation has timed out.');
        if (dispatchLocker !== undefined) {
          dispatchLocker({ type: 'reset', lockerId: { locker: 0, compartment: 0 }});
        }
        if (dispatchStepper !== undefined) {
          dispatchStepper({ type: 'prev' });
        }
        navigate('/contact');
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearTimeout(timeout);
    }
  }, [selectedLocker]);

  const errorMsgProp = errorMsg !== '' ? { errorMsg: errorMsg } : {};

  return (
    <div>
      <FloorPlanCarousel onSelectLocker={() => setErrorMsg('')} {...errorMsgProp}/>
      <FormPageNavigation onPrev={handleClickPrevPage} onNext={handleClickNextPage}/>
    </div>
  );
}
