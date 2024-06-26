import React from "react";

import "./LockerCompartment.css";
import { LockingMechanism } from "./LockerModel";
import KeyLockImgUri from "../../public/assets/key-lock.png";
import CombinationLockImgUri from "../../public/assets/digit-lock.png";

export const enum LockerCompartmentState {
  AVAILABLE,
  SELECTED
}

/**
 * The id used to identify a locker compartment globally.
 */
export type LockerId = {
  locker: number;
  compartment: number;
}

interface LockerCompartmentProps {
  /** The locker compartment number */
  number: number;
  /** The locker compartment lock type */
  lockType: LockingMechanism;
  /** The locker compartment availability state */
  isAvailable: boolean;
  /** The locker compartment selected state */
  isSelected: boolean;
  /** The locker compartment click event handler */
  onClick: (n: number) => void;
}

export default function LockerCompartment({number, lockType, isAvailable, isSelected, onClick}: LockerCompartmentProps) {

  const lockImage = (lockType === LockingMechanism.KEY) ? KeyLockImgUri : CombinationLockImgUri;

  return (
    <div key={number} className={"locker-compartment"}>
      <button className={"locker-button" + (isSelected ? " selected" : "")}
        disabled={ !isAvailable}
        onClick={() => onClick(number)}>
        <div className="button-content">
          <span>{number}</span>
          <img src={lockImage}/>
        </div>
      </button>
    </div>
  );
}
