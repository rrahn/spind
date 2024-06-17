import React, { useCallback, useContext, useEffect, useState } from 'react';
import LockerCompartment, { LockerId } from './LockerCompartment';
import './Locker.css';
import { LockingMechanism } from './LockerModel';
import { LockerSelectionContext, LockerSelectionDispatchContext } from '../contexts/LockerSelectionContext';
import { SocketContext } from '../contexts/SocketContext';

interface LockerProps {
  /** A unique identifier to describe the locker */
  id: number;
  /** The handler invoked when a locker is selected. */
  onSelectLocker?: () => void;
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

export default function Locker({id, onSelectLocker}: LockerProps) {

  const selectedLocker = useContext(LockerSelectionContext);
  const socket = useContext(SocketContext);
  const dispatch = useContext(LockerSelectionDispatchContext);

  const [lockerUnit, setLockerUnit] = useState<Array<LockerCompartment>>([]);

  const fetchData = useCallback(async (id: number) => {
    try {

      const response = await fetch('/api/getLockers/unit/' + id);
      const data = await response.json();
      // console.log('Received locker compartments: %j', data);
      setLockerUnit(data);
    } catch (error) {
      console.error('Failed to fetch locker compartments', error);
    }
  }, [lockerUnit, id]);

  useEffect(() => {
    fetchData(id);
  }, []);

  useEffect(() => {

    const onLockerUpdate = async (lockerId: LockerId) => {
      console.log('Received locker update: %j', lockerId);
      console.log('Current id: ' + id);
      if (lockerId.locker === -1) return; // nothing to do since, the update is not for this locker unit
      await fetchData(id);

    };

    socket.on('lockerUpdate', onLockerUpdate);
    return () => {
      socket.off('lockerUpdate', onLockerUpdate);
    }
  }, [socket, id, lockerUnit]);

  /**
   * Handles the selection of a compartment
   * @param compartmentId The id of the selected compartment
   * @returns void
   **/
  const handleReserve = async (compartmentId: number) => {
    if (compartmentId === null) return;
    const lockerId = {locker: id, compartment: compartmentId} as LockerId;

    try {
      // First send a post request to reserve the selected locker.
      const postData = { newLocker: lockerId, oldLocker: selectedLocker };
      // TODO: Only call reserve locker API. No need to encode the reserved locker data inside the URL.
      const response = await fetch('/api/reserveLocker/unit/'+ id + '/compartment/' + compartmentId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postData }),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Failed to reserve locker');
      }

      // Update locker status locally after successful reservation
      if (dispatch !== undefined) {
        dispatch({ type: 'select', lockerId: lockerId});
      }

      // Notify the parent component that a locker has been selected
      if (onSelectLocker !== undefined) {
        onSelectLocker();
      }

    } catch (error) {
      console.error('Failed to reserve locker', error);
      // TODO: Handle error, e.g., show a message to the user
    }
  };

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
              onClick={handleReserve}/>;
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
