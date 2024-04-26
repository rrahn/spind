import { useContext, useState } from 'react';
import LockerCompartment, { LockerId } from './LockerCompartment';
import './Locker.css';
import { LockingMechanism } from '../model/LockerModel';
import { LockerSelectionContext, LockerSelectionDispatchContext } from '../contexts/LockerSelectionContext';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  lockType: LockingMechanism;
}

export default function Locker({id, lockType}: LockerProps) {

  const selectedLocker = useContext(LockerSelectionContext);
  const dispatch = useContext(LockerSelectionDispatchContext);

  /**
   * Handles the selection of a compartment
   * @param compartmentId The id of the selected compartment
   * @returns void
   **/
  function handleCompartmentSelection(compartmentId: number) {
    const lockerId = {locker: id, compartment: compartmentId} as LockerId;
    if (dispatch !== undefined)
      dispatch({ type: 'select', lockerId: lockerId});
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
              isSelected={(n === selectedLocker.compartment && selectedLocker.locker === id) ? true : false}
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
