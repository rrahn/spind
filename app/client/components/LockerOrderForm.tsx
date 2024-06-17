import React from 'react';
import ContactInformation from './ContactInformation';
import './LockerOrderForm.css';
import FloorPlanCarousel from './FloorPlanCarousel';

export interface LockerOrderFormProps {
  /** Function callback to be called when form is submitted. */
  handleSubmit: () => void;
}

export default function LockerOrderForm({handleSubmit}: LockerOrderFormProps) {

  return (
    <form className="flex-box--column" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <ContactInformation />
      <FloorPlanCarousel/>
      {/* Choose payment option */}
      <input
        type="submit"
        // disabled={!hasNoInvalidInput}
        value="Submit"
      ></input>
    </form>
  );
}
