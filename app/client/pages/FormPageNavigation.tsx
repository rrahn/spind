import { MouseEvent } from "react";
import { Form } from "react-router-dom";
import { Button } from "../components/Button";

interface FormPageNavigationProps {
  /** The handler that is executed with the event target when on next is called or null */
  onNext?: () => void;
  /** The handler that is executed with the event target when on next is called or null */
  onPrev?: () => void;
}

export default function FormPageNavigation({onNext, onPrev}: FormPageNavigationProps) {

  return (
    <div>
      { onPrev && <Button
                  label="Zurück"
                  color="secondary"
                  size="large"
                  onClick={onPrev} />}
      {onNext && <Button
                  label="Weiter"
                  type="submit"
                  color="primary"
                  size="large"
                  onClick={onNext} />}
    </div>
  );
}
