import React from "react";

import "./LockerCompartment.css";

interface LockerCompartmentProps {
  /** The locker compartment number */
  number: number;
  /** The locker compartment lock type */
  lockType: string;
}

export default function LockerCompartment({number, lockType}: LockerCompartmentProps) {
  const lockImage = "./" + lockType + "-lock.png";
  return (

    <div className={"locker-compartment"}>
      <button>
        <div className="button-content">
          <span>{number}</span>
          <img src={lockImage}/>
        </div>
      </button>
    </div>
  );
}
