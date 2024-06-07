import { useState } from "react";
import NameInput from "./NameInput";
import GradeDropDown from "./GradeDropDown";

import "./ContactInformation.css"
import "./Tooltip.css"
import { FieldError, useFormContext } from "react-hook-form";

export type ContactInformationData = {
  forename: string,
  surname: string,
  selectedClass: string,
  email: string,
  emailVerification: string,
}

interface ContactInformationProps {
  contactData: ContactInformationData;
  onContactDataChange: (data: ContactInformationData) => void;
}

const nameValidationOption = {
  pattern: {
    value: /^[a-zA-ZÀ-ž\s\-]*$/,
    message: 'Nur lateinische Buchstaben, Bindestrich und Leerzeichen sind erlaubt.',
  },
};

export default function ContactInformation({contactData, onContactDataChange, ...props}: ContactInformationProps) {

  const { watch, formState: { errors } } = useFormContext();

  const classes = ['5N', '6N', '7A', '7B', '7N', '8A', '8B', '8N', '9A', '9B', '9N', '10A', '10B', '10N',  '11', '12'];

  const primaryEmail = watch('email', contactData.email);

  console.log('primary email: ', primaryEmail);

  return (
    <div>
      <p className='info-message'>Geben Sie Name und Klasse des Schülers/der Schülerin ein.</p>

      <div className='flex-box--row'>
        <div className='flex-box--flex-column tooltip-container'>
          <NameInput
            inputId="forename"
            inputLabel="Vorname"
            inputType="text"
            options={nameValidationOption}
            error={errors.forename as FieldError | undefined}
          />
        </div>
        <div className='flex-box--flex-column tooltip-container'>
          <NameInput
            inputId="surname"
            inputLabel="Nachname"
            inputType="text"
            options={nameValidationOption}
            error={errors.surname as FieldError | undefined}
          />
        </div>
        <GradeDropDown
          message={"Klasse"}
          grades={classes}
        />
        </div>
      <p className='info-message'>Geben Sie Ihre Email-Adresse an.</p>
      <div className='flex-box--row'>
        <div className='flex-box--flex-column'>
          <NameInput
            inputId="email"
            inputLabel="Email"
            inputType="email"
            error={errors.email as FieldError | undefined}
          />
        </div>
        <div className='flex-box--flex-column tooltip-container'>
          <NameInput
            inputId="emailVerification"
            inputLabel="Email verifizieren"
            inputType="email"
            options={{validate: (value) => value === primaryEmail || 'Email stimmt nicht überein'}}
            error={errors.emailVerification as FieldError | undefined}
          />
        </div>
     </div>
    </div>
  );
}
