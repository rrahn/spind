import { useContext } from "react";

import FormPageNavigation from "./FormPageNavigation";
import { useNavigate } from "react-router-dom";
import ContactInformation, { ContactInformationData } from "../components/ContactInformation";
import { ContactDispatchContext } from "../contexts/ContactContext";
import { StepperDispatchContext } from "../contexts/StepperContext";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

export default function FormPageContact() {

  const methods = useForm<ContactInformationData>();
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
  }

  const onSubmit: SubmitHandler<ContactInformationData> = (data) => {
    console.log(data)
    if (dispatchContact !== undefined) {
      dispatchContact({ type: 'update', contact: data});
    }
    handleClickNextPage();
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ContactInformation />
        <FormPageNavigation onNext={() => {}}/>
        </form>
      </FormProvider>
    </div>
  );
}
