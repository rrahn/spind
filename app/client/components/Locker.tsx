import { useContext, useEffect, useState } from 'react';
import LockerCompartment, { LockerId } from './LockerCompartment';
import './Locker.css';
import { LockingMechanism } from './LockerModel';
import { LockerSelectionContext, LockerSelectionDispatchContext } from '../contexts/LockerSelectionContext';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** Type of the locker*/
  // lockType: LockingMechanism;
}

enum LockerCompartmentState {
  FREE = 'Free',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  OUT_OF_ORDER = 'OutOfOrder'
}

interface LockerCompartment {
  id: number;
  kind: LockingMechanism;
  state: LockerCompartmentState;
}

export default function Locker({id}: LockerProps) {

  const selectedLocker = useContext(LockerSelectionContext);
  const dispatch = useContext(LockerSelectionDispatchContext);

  const [lockerUnit, setLockerUnit] = useState<Array<LockerCompartment> | null>();

  useEffect(() => {
    const fetchData = async (id: number) => {
      const response = await fetch('/api/getLockers/unit/' + id);
      const data = await response.json();
      // console.log('Received locker compartments: %j', data);
      setLockerUnit(data);
    };
    fetchData(id);

    return () => {};
  }, [id]);

  /**
   * Handles the selection of a compartment
   * @param compartmentId The id of the selected compartment
   * @returns void
   **/
  function handleCompartmentSelection(compartmentId: number) {
    const lockerId = {locker: id, compartment: compartmentId} as LockerId;
    if (dispatch !== undefined) {
      dispatch({ type: 'select', lockerId: lockerId});
    }
  }

  // Create the locker compartments from the locker capacity.
  // Two types of lockers are supported: key (3 by 3) and digit (5 by 2).
  const lockerCapacity = lockerUnit?.length;
  const LockerCompartments = lockerUnit?.map((compartment) => {
    return <LockerCompartment
              key={compartment.id}
              number={compartment.id}
              lockType={compartment.kind}
              isAvailable={compartment.state === LockerCompartmentState.FREE ? true : false}
              isSelected={(selectedLocker.compartment === compartment.id && selectedLocker.locker === id) ? true : false}
              onClick={handleCompartmentSelection}/>;
  });

  const lockType = (lockerUnit?.length === 9) ? 'key' : 'digit';

  if (lockerCapacity === undefined) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className={'locker' + ' ' + lockType}>
        <div className='grid-container'>
          {LockerCompartments}
        </div>
        <span className='locker-id'>{id}</span>
      </div>
    );
  }
}
