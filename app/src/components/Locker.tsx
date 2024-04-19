import React from 'react';
import LockerCompartment, { LockerId } from './LockerCompartment';
import './Locker.css';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  lockerType: string;
}

export default function Locker({id, lockerType}: LockerProps) {

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
  const lockerCapacity = lockerType === 'key' ? 9 : 10;
  const LockerCompartments = [...Array(lockerCapacity).keys()]
                                .map(idx => ++idx)
                                .map((n) => {
    return <LockerCompartment
              number={n}
              lockType={lockerType}
              isAvailable={true}
              isSelected={n === selectedCompartmentId?.compartment}
              onClick={handleCompartmentSelection}/>;
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
