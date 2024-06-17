import React, { useContext } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import { ContactContext } from "../contexts/ContactContext";
import { LockerSelectionContext } from "../contexts/LockerSelectionContext";
import { StepperDispatchContext } from "../contexts/StepperContext";

export default function FormPageContact() {
  const navigate = useNavigate();
  const dispatchStepper = useContext(StepperDispatchContext);

  const contact = useContext(ContactContext);
  const locker = useContext(LockerSelectionContext);

  const handleClickNextPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'next' });
    }
    navigate('/payment');
  }

  const handleClickPrevPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'prev' });
    }
    navigate('/locker');
  }
  return (
    <div>

      <p><span>Name: {contact.forename} {contact.surname}</span></p>
      <p><span>Klasse: {contact.selectedClass} </span></p>
      <p><span>Email: {contact.email} </span></p>
      <p><span>Schrank: {locker.locker} </span><span>Fach: {locker.compartment} </span></p>
      <FormPageNavigation onPrev={handleClickPrevPage} onNext={handleClickNextPage}/>
    </div>
  );
}
