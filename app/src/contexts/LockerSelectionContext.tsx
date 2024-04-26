import { Dispatch, createContext, useReducer } from "react";
import { LockerId } from "../components/LockerCompartment";

/** Provides context to the currently selected locker */
export const LockerSelectionContext = createContext<LockerId>({} as LockerId);

/** Provides context to set the selected locker */
export const LockerSelectionDispatchContext = createContext<Dispatch<LockerSelectionAction> | undefined>(undefined);

export function LockerSelectionProvider({ children }: { children: React.ReactNode }) {

  // Initialize the selected locker to 0 and set the reducer function to handle the locker selection
  const [selectedLocker, dispatch] = useReducer(lockerSelectionReducer, {locker: 0, compartment: 0});

  // Return the context provider with the selected locker and the dispatch function
  return (
    <LockerSelectionContext.Provider value={selectedLocker}>
      <LockerSelectionDispatchContext.Provider value={dispatch}>
        {children}
      </LockerSelectionDispatchContext.Provider>
    </LockerSelectionContext.Provider>
  );
}

// Specific type to handle the locker selection action
type LockerSelectionAction = {
  type: string;
  lockerId: LockerId;
};

// Reducer to handle the actions when selecting a locker
function lockerSelectionReducer(currentLocker: LockerId, action: LockerSelectionAction) {
  switch (action.type) {
    case 'select': {
      return action.lockerId;
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
