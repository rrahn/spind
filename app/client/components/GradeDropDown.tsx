import React, { useState } from "react";
import './GradeDropDown.css';

export interface GradeDropDownProps {
  /** The message of the input label */
  message: string;
  /** The list of selectable grades */
  grades: string[];
  /** The selected grade */
  selectedGrade: string;
  /** Function to be called when grade is selected */
  onSelectGrade: (grade: string) => void;
}

export default function GradeDropDown({message, grades, selectedGrade, onSelectGrade}: GradeDropDownProps) {

  const [selection, setSelection] = useState(message);
  const [isChecked, setIsChecked] = useState(false);

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, grade: string) => {
    console.log('The passed event: ' + event);
    console.log('The selected grade is: ' + grade );
    onSelectGrade(grade);
    setSelection(grade);
    setIsChecked(false);
  }

  const handleToggle = () => {
    setIsChecked(!isChecked);
  }

  const hasSelection = selection !== message;

  return (
    <div className="dropdown toggle flex-box--fixed-column-150px">
      <input
        id="t1"
        data-testid="t1"
        type="checkbox"
        checked={isChecked}
        value={selection}
        required={true}
        onChange={handleToggle}
        >
      </input>
      <label htmlFor="t1" className={hasSelection ? 'as-text' : 'as-placeholder'}>{selection}
        <span className={hasSelection ? 'as-side-note' : 'as-placeholder'}>{message}</span>
      </label>
      <ul>
        {grades.map((grade, idx) => <li key={idx}><a onClick={e => handleSelect(e, grade)}>{grade}</a></li>)}
      </ul>
    </div>
  );
}
