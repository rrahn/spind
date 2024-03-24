import React from 'react';
import LockerCompartment from './LockerCompartment';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: string;
  lockerCompartments: typeof LockerCompartment[];
}

export default function Locker({id}: LockerProps) {
  const lockerNumber = id.split('.')[0];
  const lockerBox = id.split('.')[1];
  return (
    <div className={`locker-summary`}>
      <label htmlFor="locker-number" aria-label={`locker-${id}`} className="locker-id">Schrank:
        <input
          type="text"
          value={`${lockerNumber}`}
          readOnly={true}
          name="locker-number"
          placeholder="Locker ID"
        />
      </label>
      <label htmlFor="locker-box" aria-label={`locker-${id}`} className="locker-id">Fach:
        <input
          type="text"
          value={lockerBox}
          readOnly={true}
          name="locker-box"
          placeholder="Locker Box"
        />
      </label>
    </div>
  );
}
