import { useContext, useState, FormEvent } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { Form, useLoaderData, useNavigate } from "react-router-dom";
import ContactInformation, { ContactInformationData } from "../components/ContactInformation";
import { ContactContext, ContactDispatchContext } from "../contexts/ContactContext";
import { StepperDispatchContext } from "../contexts/StepperContext";
import { Button } from "../components/Button";

export default function FormPageContact() {

  const [contactData, setContactData] = useState<ContactInformationData>({} as ContactInformationData);
  const contact = useContext(ContactContext);
  const dispatchContact = useContext(ContactDispatchContext);
  const dispatchStepper = useContext(StepperDispatchContext);

  const navigate = useNavigate();

  const handleClickNextPage = () => {
    if (dispatchStepper !== undefined) {
      dispatchStepper({ type: 'next' });
    }
    navigate('/locker');
  }

  function handleContactUpdate(updatedContact: ContactInformationData) {
    if (dispatchContact !== undefined) {
      dispatchContact({ type: 'update', contact: updatedContact});
    }
    // console.log('Notify dispatch stepper about next page');

    // todo: handle verification to make button clickable
  }

  function handleSubmit() {
    console.log('Form submitted:');

    for (let [key, value] of Object.entries(contact)) {
      console.log(`${key}: ${value}`);
    }
  }

  return (
    <div>
      {/* <label>First Name:</label>
      <input type="text" name="firstName" />

      <label>Last Name:</label>
      <input type="text" name="lastName" />

      <label>Email:</label>
      <input type="email" name="email" /> */}
      <ContactInformation
        contactData={contact}
        onContactDataChange={handleContactUpdate}
        />
      {/* <button type="submit" form="contact-form">Weiter</button> */}
      <Button
          label="Weiter"
          type="submit"
          color="primary"
          size="large"
          onClick={handleSubmit}/>
      {/* <FormPageNavigation onNext={handleClickNextPage}/> */}
    </div>
  );
}
