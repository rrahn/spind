import { register } from "module";
import "./NameInput.css";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export interface NameInputProps {
  /** The id of the input field */
  inputId: string;
  /** The label of the input field*/
  inputLabel: string;
  /** The value of the input field */
  inputValue: string;
  /** The type of the input field */
  inputType: string;
  /** Function to be called when input field is changed */
  onNameChange: (name: string) => void;
}

export default function NameInput({inputId, inputLabel, inputValue, inputType, onNameChange, ...props}: NameInputProps) {

  const { register, watch, formState: { errors } } = useFormContext();
  const primaryEmail = watch('email');

  const isInvalidEmail2 = inputId === 'emailVerification' && errors.emailVerification;
  const invalidInput = isInvalidEmail2 ? 'invalid-input' : '';

  return (

    <div className='user-input'>
      <label htmlFor={inputId}>
        {inputId === 'emailVerification' ?
          <input
            className={["user-input__text", invalidInput].join(' ')}
            id={inputId}
            data-testid={inputId}
            type={inputType}
            placeholder=""
            required={true}
            {...register(inputId, {validate: (value) => value === primaryEmail || 'Email stimmt nicht überein'})}
          /> :
          <input
            className="user-input__text"
            id={inputId}
            data-testid={inputId}
            type={inputType}
            placeholder=""
            required={true}
            {...register(inputId)}
          />
        }
        <span>{inputLabel}</span>
      </label>
    </div>
  );
}
