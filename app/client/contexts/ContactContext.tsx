import { Dispatch, createContext, useReducer, ReactNode } from "react";
import { ContactInformationData } from "../components/ContactInformation";

/** Provides context to the currently selected locker */
export const ContactContext = createContext<ContactInformationData>({} as ContactInformationData);

/** Provides context to set the selected locker */
export const ContactDispatchContext = createContext<Dispatch<ContactAction> | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {

  // Initialize the current contact to empty data (maybe the placeholder data?).
  const [contact, dispatch] = useReducer(ContactReducer, {forename: "", surname: "", email: "", emailVerification: "", selectedClass: ""} as ContactInformationData);

  // Return the context provider with the selected locker and the dispatch function
  return (
    <ContactContext.Provider value={contact}>
      <ContactDispatchContext.Provider value={dispatch}>
        {children}
      </ContactDispatchContext.Provider>
    </ContactContext.Provider>
  );
}

// Specific type to handle the locker selection action
type ContactAction = {
  type: string;
  contact: ContactInformationData;
};

// Reducer to handle the actions when filling out the contact form
function ContactReducer(currentContact: ContactInformationData, action: ContactAction) {
  switch (action.type) {
    case 'update': {
      return action.contact;
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
