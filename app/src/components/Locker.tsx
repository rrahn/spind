import React from 'react';
import LockerCompartment, { LockerId } from './LockerCompartment';
import './Locker.css';
import { LockingMechanism } from '../model/LockerModel';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  lockType: LockingMechanism;
}

export default function Locker({id, lockType}: LockerProps) {

  const [selectedCompartmentId, setSelectedCompartmentId] = React.useState<LockerId | null>(null);

  /**
   * Handles the selection of a compartment
   * @param compartmentId The id of the selected compartment
   * @returns void
   **/
  function handleCompartmentSelection(compartmentId: number) {
    setSelectedCompartmentId({locker: id, compartment: compartmentId});
  }

  // Create the locker compartments from the locker capacity.
  // Two types of lockers are supported: key (3 by 3) and digit (5 by 2).
  const lockerCapacity = lockType === LockingMechanism.KEY ? 9 : 10;
  const LockerCompartments = [...Array(lockerCapacity).keys()]
                                .map(idx => ++idx) // start with 1
                                .map((n) => {
    return <LockerCompartment
              key={n}
              number={n}
              lockType={lockType}
              isAvailable={true}
              isSelected={n === selectedCompartmentId?.compartment}
              onClick={handleCompartmentSelection}/>;
  });

  return (
    <div className={'locker' + ' ' + lockType}>
      <div className='grid-container'>
        {LockerCompartments}
      </div>
      <span className='locker-id'>{id}</span>
    </div>
  );
}
