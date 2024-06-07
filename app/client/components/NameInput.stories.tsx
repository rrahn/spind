import NameInput from "./NameInput";
import { StoryObj, Meta, composeStory } from "@storybook/react";
import { FormProvider, useForm } from "react-hook-form";
import { ContactDispatchContext, ContactProvider } from "../contexts/ContactContext";
import { useContext } from "react";

const withFormDecorator = (Story: any) => {
  console.log('Register form provider.');
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Story />
    </FormProvider>
  );
};

const withContactProvider = (Story: any) => {
  console.log('Register contact provider.');
  return (
    <ContactProvider>
      <Story />
    </ContactProvider>
  );
};

const meta = {
    title: 'Base/NameInput',
    component: NameInput,
    tags: ['autodocs'],
    decorators: [(Story, { parameters }) => {
      const contactDispatch = useContext(ContactDispatchContext);
      const { forename = "", surname = "", selectedClass = "", email = "", emailVerification = "" } = parameters;

      if (contactDispatch) {
        console.log('updating contact data: %j', parameters );
        contactDispatch({ type: 'update', contact: { forename, surname, selectedClass, email, emailVerification } });
      }
      console.log('Before rendering NameInput.');
      return ( <Story /> );
    }, withContactProvider, withFormDecorator],
} as Meta<typeof NameInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
    args: {
      inputId: 'forename',
      inputLabel: 'Name',
      inputType: 'text',
    },
};

export const ValidName: Story = {
  parameters: {
    forename: 'John',
    surname: 'Doe',
  },
  args: {
    ...TextInput.args,
  },
};

export const EmailInput: Story = {
  parameters: {
    email: 'test@email.com',
  },
  args: {
    inputId: 'email',
    inputType: 'email',
    inputLabel: 'Email',
  },
};

export const InvalidEmail: Story = {
  parameters: {
    email: 'test123email.com',
  },
  args: {
    ...EmailInput.args,
  },
};
