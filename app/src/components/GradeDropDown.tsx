import React, { useState } from "react";

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

  const gradesWithMessage = [message, ...grades];
  return (
    <div>
      <select
        className={"select-grade-" + selectedGrade}
        id="input-class"
        data-testid="input-class"
        name="input-class"
        value={selectedGrade}
        onChange={e => onSelectGrade(e.target.value)}
      >
        {gradesWithMessage.map((grade, idx) => <option key={idx} value={grade}>{grade}</option>)}
      </select>
    </div>
  );
}
