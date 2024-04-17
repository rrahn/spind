import React from 'react';
import LockerCompartment from './LockerCompartment';
import './Locker.css';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  lockerType: string;
}

export default function Locker({id, lockerType}: LockerProps) {

  const lockerCapacity = lockerType === 'key' ? 9 : 10;
  const LockerCompartments = [...Array(lockerCapacity).keys()]
                                .map(idx => ++idx)
                                .map((n) => {
    return <LockerCompartment number={n} lockType={lockerType}/>;
  });

  return (
    <div className={'locker' + ' ' + lockerType}>
      <div className='grid-container'>
        {LockerCompartments}
      </div>
      <span className='locker-id'>{id}</span>
    </div>
  );
}
