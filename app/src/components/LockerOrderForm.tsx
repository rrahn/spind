import React from 'react';
import NameInput from './NameInput';
import './LockerOrderForm.css';
import GradeDropDown from './GradeDropDown';

export interface LockerOrderFormProps {
  /** A list of grades to select from. */
  grades: string[];

}

export default function LockerOrderForm({grades}: LockerOrderFormProps) {

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [grade, setGrade] = React.useState('');

  return (
    <form className='flex-box--column'>
      <p className='title'>Schrankbestellung</p>
      <p className='info-message'>Geben Sie die Daten ihres Kindes ein.</p>
      <div className='flex-box--row'>
        <NameInput inputLabel="Vorname" inputValue={firstName} inputType='text' onNameChange={(value) => setFirstName(value)} />
        <NameInput inputLabel="Nachname" inputValue={lastName} inputType='text' onNameChange={(value) => setLastName(value)} />
        <GradeDropDown message="Klasse..." grades={grades} selectedGrade={grade} onSelectGrade={(value) => setGrade(value)}/>
      </div>
      {/* Select locker -> if input data is valid or if grade selected display map?
      */}
      <p className='info-message'>Geben Sie eine Emailadresse für die Bestellbestätigung an.</p>
      <NameInput inputLabel="Email" inputValue={email} inputType='email' onNameChange={(value) => setEmail(value)} />
      {/* Choose payment option */}
    </form>
  );
}
