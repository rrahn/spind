import { register } from "module";
import "./NameInput.css";
import { FieldError, RegisterOptions, useFormContext } from "react-hook-form";
import { Fragment, useContext, useEffect } from "react";
import { ContactContext } from "../contexts/ContactContext";

export interface NameInputProps {
  /** The id of the input field */
  inputId: string;
  /** The label of the input field*/
  inputLabel: string;
  /** The type of the input field */
  inputType: string;
  /** Options for the input fields when registering to the react-hook-form (e.g. validation rules).*/
  options?: RegisterOptions;
  /** An optional field error in case validation was not successful. */
  error?: FieldError;
}

export default function NameInput({inputId, inputLabel, inputType, ...props}: NameInputProps) {

  const { register, setValue } = useFormContext();
  const contactData = useContext(ContactContext);

  const invalidInput = props.error ? 'invalid-input' : '';

  useEffect(() => {
    setValue(inputId, contactData[inputId as keyof typeof contactData], {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [contactData, setValue, inputId]);

  return (
    <Fragment>
      <div className='user-input'>
        <label htmlFor={inputId}>
            <input
              className={["user-input__text", invalidInput].join(' ')}
              id={inputId}
              data-testid={inputId}
              type={inputType}
              placeholder=""
              required={true}
              {...register(inputId, props.options)}
            />
          <span>{inputLabel}</span>
        </label>
      </div>
      {props.error?.message &&
        <span className={["tooltip", props.error ? "show-tooltip" : ""].join(" ")}>{props.error.message.toString()}</span>
      }
    </Fragment>
  );
}
