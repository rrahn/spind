import "./NameInput.css";

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

export default function NameInput({inputId, inputLabel, inputValue, inputType, onNameChange}: NameInputProps) {

  return (
    <div className='user-input'>
      <label htmlFor={inputId}>
        <input
          className="user-input__text"
          id={inputId}
          data-testid={inputId}
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
