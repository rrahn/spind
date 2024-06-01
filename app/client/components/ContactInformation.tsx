import { useState } from "react";
import NameInput from "./NameInput";
import GradeDropDown from "./GradeDropDown";

import "./ContactInformation.css"

export type ContactInformationData = {
  forename: string,
  surname: string,
  email: string,
  selectedClass: string,
}

interface ContactInformationProps {
  contactData: ContactInformationData;
  onContactDataChange: (data: ContactInformationData) => void;
}

export default function ContactInformation({contactData, onContactDataChange}: ContactInformationProps) {

  const [verificationEmail, setVerificationEmail] = useState('');

  const classes = ['5N', '6N', '7A', '7B', '7N', '8A', '8B', '8N', '9A', '9B', '9N', '10A', '10B', '10N',  '11', '12'];

  return (
    <div>
      <p className='title'>Schrankbestellung</p>
      <p className='info-message'>Geben Sie Name und Klasse des Schülers/der Schülerin ein.</p>
      <div className='flex-box--row'>
        <NameInput
          inputId="forename"
          inputLabel="Vorname"
          inputValue={contactData.forename}
          inputType="text"
          onNameChange={(name) => onContactDataChange({...contactData, forename: name})}
        />
        <NameInput
          inputId="surname"
          inputLabel="Nachname"
          inputValue={contactData.surname}
          inputType="text"
          onNameChange={(name) => onContactDataChange({...contactData, surname: name})}
        />
        <GradeDropDown
          message={"Klasse"}
          grades={classes}
          selectedGrade={contactData.selectedClass}
          onSelectGrade={(c: string) => onContactDataChange({...contactData, selectedClass: c})}
        />
        </div>
      <p className='info-message'>Geben Sie Ihre Email-Adresse an.</p>
      <div className='flex-box--row'>
        <NameInput
          inputId="email-1"
          inputLabel="Email"
          inputValue={contactData.email}
          inputType="email"
          onNameChange={(email) => onContactDataChange({...contactData, email: email})}
        />
        <NameInput
          inputId="email-2"
          inputLabel="Email verifizieren"
          inputValue={verificationEmail}
          inputType="email"
          onNameChange={(email) => setVerificationEmail(email)}
        />
     </div>
    </div>
  );
}
