import React from 'react';
import LockerCompartment from './LockerCompartment';
import './Locker.css';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  lockerType: string;
  /** The number of compartments of the locker */
  lockerCapacity: number;
}

export default function Locker({id, lockerType, lockerCapacity}: LockerProps) {

  const LockerCompartments = [...Array(lockerCapacity).keys()].map(idx => ++idx).map((n) => {
    return <LockerCompartment number={n} lockType={lockerType}/>;
  });

  return (
    <div className='locker'>
      <div className='grid-container'>
        {LockerCompartments}
      </div>
      <span className='locker-id'>{id}</span>
    </div>
  );
}
