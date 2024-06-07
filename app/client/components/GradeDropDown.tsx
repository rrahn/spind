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
  const [localGrade, setLocalGrade] = useState("");
  const contactData = useContext(ContactContext);

  useEffect(() => {
    setValue('selectedClass', contactData.selectedClass, {
      shouldValidate: false,
      shouldDirty: false
    });
    setLocalGrade(contactData.selectedClass);
  }, []);

  // Effect to register mouse clicks outside of the dropdown menu.
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

  // Callback when a grade is selected in dropdown menu.
  const handleSelect = async (event: React.MouseEvent<HTMLAnchorElement>, grade: string) => {
    setLocalGrade(grade);

    setValue('selectedClass', grade, {
      shouldValidate: true,
      shouldDirty: true
    });
    handleToggle(event);
  }

  // Callback to mimic a dropdown menu that can be toggled.
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
        value={localGrade}
        { ...register('selectedClass', {required: 'Bitte wählen sie eine Klasse'}) }
      />
      <label htmlFor="t1">
        <span>{message}</span>
      </label>
      <ul>
        {grades.map((grade, idx) => <li key={idx}><a onClick={e => handleSelect(e, grade)}>{grade}</a></li>)}
      </ul>
    </div>
  );
}
