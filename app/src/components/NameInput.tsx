import React from "react";
import "./NameInput.css";
import e from "express";

export interface NameInputProps {
  /** The label of the input field*/
  inputLabel: string;
  /** The value of the input field */
  inputValue: string;
  /** The type of the input field */
  inputType: string;
  /** Function to be called when input field is changed */
  onNameChange: (name: string) => void;
}

export default function NameInput({inputLabel, inputValue, inputType, onNameChange}: NameInputProps) {

  return (
    <div className='user-input'>
      <label htmlFor={"name-input__" + inputLabel}>
        <input
          className="user-input__text"
          name={"name-input__" + inputLabel}
          type={inputType}
          placeholder=""
          required={true}
          value={inputValue}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <span>{inputLabel}</span>
      </label>
    </div>
  );
}
