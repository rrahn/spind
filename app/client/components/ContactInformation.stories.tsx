import { useForm, FormProvider } from "react-hook-form";
import ContactInformation from "./ContactInformation";
import { StoryObj, Meta } from "@storybook/react";
import { ContactDispatchContext, ContactProvider } from "../contexts/ContactContext";
import { useContext } from "react";

const withFormDecorator = (Story: any) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Story />
    </FormProvider>
  );
};

const withContactProvider = (Story: any) => {
return (
  <ContactProvider>
    <Story />
  </ContactProvider>
);
}

const meta = {
    title: 'Base/ContactInformation',
    component: ContactInformation,
    tags: ['autodocs'],
    decorators: [(Story, { parameters }) => {
      const contactDispatch = useContext(ContactDispatchContext);
      const { contactData = { forename: "", surname: "", selectedClass: "", email: "", emailVerification: ""} } = parameters;
      if (contactDispatch) {
        contactDispatch({ type: 'update', contact: contactData });
      }
      return <Story />
    }, withContactProvider, withFormDecorator],
} as Meta<typeof ContactInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
};

export const FilledTest: Story = {
  parameters: {
    contactData: {
      forename: "John",
      surname: "Doe",
      email: "john.doe@mail.com",
      emailVerification: "john.doe@mail.com",
      selectedClass: "5N",
    },
  }
};

