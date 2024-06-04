import "./Button.css"

interface ButtonProps {
  label: string;
  type?: "button" | "submit" | "reset";
  color?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  shape?: "round" | "circle";
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = ({label, type = "button", ...props}: ButtonProps) => {

  const btnColor = props.color ? `btn--${props.color}` : "";
  const btnShape = props.shape ? `btn--${props.shape}` : "";
  const btnDisabled = props.disabled ? "disabled" : "";
  const btnSize = props.size ? `btn--${props.size}` : "";

  return (
    <button
        type={type}
        className={["btn", btnColor, btnShape, btnDisabled, btnSize].join(" ")}
        onClick={props.onClick}
        >
      {label}
    </button>
  );
}
