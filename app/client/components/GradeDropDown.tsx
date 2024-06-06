import React, { ChangeEvent, Fragment, useContext, useEffect, useRef, useState } from "react";
import './GradeDropDown.css';
import { ContactContext, ContactDispatchContext } from "../contexts/ContactContext";
import { Controller, useController, useFormContext } from "react-hook-form";

export interface GradeDropDownProps {
  /** The message of the input label */
  message: string;
  /** The list of selectable grades */
  grades: string[];
  /** The selected grade */
  selectedGrade?: string;
  /** Function to be called when grade is selected */
  onSelectGrade?: (grade: string) => void;
}

export default function GradeDropDown({message, grades, selectedGrade, onSelectGrade, ...props}: GradeDropDownProps) {

  const { register, setValue, formState} = useFormContext();
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const contact = useContext(ContactContext);
  const dispatchContact = useContext(ContactDispatchContext);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = async (event: React.MouseEvent<HTMLAnchorElement>, grade: string) => {
    if (dispatchContact !== undefined) {
      dispatchContact({ type: 'update', contact: {...contact, selectedClass: grade}});
    }

    setValue('selectedClass', grade, {
      shouldValidate: true,
      shouldDirty: true
    });
    handleToggle(event);
  }

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowOptions(!showOptions);
  }

  const optionStyle = showOptions ? "show-options" : "hide-options";
  const dropDownStyle = ["dropdown", "toggle", "flex-box--fixed-column-150px", optionStyle].join(' ');

  return (
    <div ref={dropdownRef}
         className={dropDownStyle}
         onClick={handleToggle}>
      <input
        id="t1"
        data-testid="t1"
        type="text"
        readOnly={true}
        placeholder=""
        value={contact.selectedClass}
        { ...register('selectedClass', {required: 'Bitte wählen sie eine Klasse'}) }
      />
      <label htmlFor="t1">
        <span>{message}</span>
      </label>
      <ul>
        {grades.map((grade, idx) => <li key={idx}><a onClick={e => handleSelect(e, grade)}>{grade}</a></li>)}
      </ul>
      {/* Display validation error message */}
        {/* {formState.errors.selectedClass && (
          <span>{String(formState.errors.selectedClass.message)}</span>
        )} */}
    </div>
  );
}
