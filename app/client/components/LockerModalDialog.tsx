import { DialogHTMLAttributes, useEffect, useRef } from "react";
import { Button } from "./Button";

interface LockerModalDialogProps {
  /** The modal open state */
  openModal: boolean;
  /** The function to close the modal */
  closeModal: () => void;
  /** The modal children to be rendered */
  children: React.ReactNode;
}

/**
 * A modal dialog component
 * @param openModal The modal open state
 * @param closeModal The function to close the modal
 * @param children The modal children to be rendered
 * @returns The modal dialog component
 **/
export default function LockerModalDialog({ openModal, closeModal, children } : LockerModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (openModal) {
      dialogRef.current?.showModal(); // Added null check
    } else {
      dialogRef.current?.close(); // close dialog in all other cases
    }
    return () => dialogRef.current?.close(); // cleanup
  }, [openModal]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={closeModal}
    >
      {children}
      <Button label="Ok" size="small" onClick={closeModal}/>
    </dialog>
  );
}
