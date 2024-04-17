import React from "react";

import "./LockerCompartment.css";

export const enum LockerCompartmentState {
  FREE,
  RESERVED,
  ASSIGNED,
}

interface LockerCompartmentProps {
  /** The locker compartment number */
  number: number;
  /** The locker compartment lock type */
  lockType: string;
  /** The state of the compartment */
  state?: LockerCompartmentState;
}

export default function LockerCompartment({number, lockType, state = LockerCompartmentState.FREE}: LockerCompartmentProps) {
  const lockImage = "./" + lockType + "-lock.png";
  return (

    <div className={"locker-compartment"}>
      <button disabled={state != LockerCompartmentState.FREE}>
        <div className="button-content">
          <span>{number}</span>
          <img src={lockImage}/>
        </div>
      </button>
    </div>
  );
}
