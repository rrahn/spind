import { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button = ({label, ...props}: ButtonProps) => {
  const [buttonLabel, setButtonLabel] = useState(label);

  return (
    <button
        type="button"
        {...props}>
      {label}
    </button>
  );
}
