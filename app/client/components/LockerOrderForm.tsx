import { useEffect, useState } from 'react';
import ContactInformation, { ContactInformationData } from './ContactInformation';
import './LockerOrderForm.css';
import FloorPlanCarousel from './FloorPlanCarousel';

export interface LockerOrderFormProps {
  /** Function callback to be called when form is submitted. */
  handleSubmit: () => void;
}

export default function LockerOrderForm({handleSubmit}: LockerOrderFormProps) {

  const [contactData, setContactData] = useState<ContactInformationData>({} as ContactInformationData);

  // const hasNoInvalidInput = contactData.forename && contactData.surname && contactData.email && contactData.selectedClass;

  function log() {
    console.log("submitted data: name=" + contactData.forename + " " + contactData.surname + ", email=" + contactData.email + ", class=" + contactData.selectedClass);
  }

  return (
    <form className="flex-box--column" onSubmit={(e) => { e.preventDefault(); log(); handleSubmit(); }}>
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
