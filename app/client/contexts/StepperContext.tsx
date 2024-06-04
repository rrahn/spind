import { Dispatch, createContext, useReducer, ReactNode } from "react";

export interface StepState {
  /** The step number */
  step: number;
}

/** Provides context to the currently selected locker */
export const StepperContext = createContext<StepState>({step: 0});

/** Provides context to set the selected locker */
export const StepperDispatchContext = createContext<Dispatch<StepperAction> | undefined>(undefined);

export function StepperContextProvider({ children }: { children: ReactNode }) {

  // Initialize the current contact to empty data (maybe the placeholder data?).
  const [step, dispatch] = useReducer(StepperReducer, {step: 0} as StepState);

  // Return the context provider with the selected locker and the dispatch function
  return (
    <StepperContext.Provider value={step}>
      <StepperDispatchContext.Provider value={dispatch}>
        {children}
      </StepperDispatchContext.Provider>
    </StepperContext.Provider>
  );
}

// Specific type to handle the stepping actions
type StepperAction = {
  type: string;
};

// Reducer to handle the actions when stepping through the pages.
function StepperReducer(currentStep: StepState, action: StepperAction) {
  switch (action.type) {
    case 'next': {
      return { step: currentStep.step + 1};
    }
    case 'prev': {
      return { step: currentStep.step - 1 };
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
