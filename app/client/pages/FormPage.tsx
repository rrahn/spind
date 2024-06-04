import { Outlet, useNavigate } from "react-router-dom";
import FormPageContact from "./FormPageContact";
import FormPageHeader from "./FormPageHeader";
import FormPageStatusBar from "./FormPageStatusBar";
import { ContactProvider } from "../contexts/ContactContext";
import { LockerSelectionProvider } from "../contexts/LockerSelectionContext";
import { useEffect } from "react";
import { StepperContextProvider } from "../contexts/StepperContext";

export default function FormPage() {

  const navigate = useNavigate();

  useEffect(() => {
    navigate("contact");
  }, [navigate]);

  return (
    <div>
      <FormPageHeader />
      <StepperContextProvider>
      <FormPageStatusBar />
        <ContactProvider>
          <LockerSelectionProvider>
            <Outlet />
          </LockerSelectionProvider>
        </ContactProvider>
      </StepperContextProvider>
    </div>
  );
}
