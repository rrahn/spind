import { Outlet, useNavigate } from "react-router-dom";
import FormPageHeader from "./FormPageHeader";
import FormPageStatusBar from "./FormPageStatusBar";
import { ContactProvider } from "../contexts/ContactContext";
import { LockerSelectionProvider } from "../contexts/LockerSelectionContext";
import { useEffect } from "react";
import { StepperContextProvider } from "../contexts/StepperContext";
import { SocketProvider } from "../contexts/SocketContext";

import "./FormPage.css"

export default function FormPage() {

  const navigate = useNavigate();

  useEffect(() => {
    navigate("contact");
  }, [navigate]);

  return (
    <div className="form-page">
      <FormPageHeader />
      <StepperContextProvider>
      <FormPageStatusBar />
        <SocketProvider>
          <ContactProvider>
            <LockerSelectionProvider>
              <Outlet />
            </LockerSelectionProvider>
          </ContactProvider>
        </SocketProvider>
      </StepperContextProvider>
    </div>
  );
}
