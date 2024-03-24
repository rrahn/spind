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
    // make this a button.
    <div className={"locker-compartment"}>
      <div>{number}</div>
      <div><img src={lockImage}/></div>
    </div>
  );
}
