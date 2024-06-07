import { FormProvider, useForm } from "react-hook-form";
import { ContactDispatchContext, ContactProvider } from "../contexts/ContactContext";
import GradeDropDown from "./GradeDropDown";

import { Meta, StoryObj } from "@storybook/react";
import React, { useContext } from "react";

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
    title: 'Base/GradeDropDown',
    component: GradeDropDown,
    tags: ['autodocs'],
    decorators: [(Story, { parameters }) => {
      const contactDispatch = useContext(ContactDispatchContext);
      const { forename="", surname="", selectedClass = "", email="", emailVerification="" } = parameters;
      if (contactDispatch) {
        contactDispatch({ type: 'update', contact: { forename, surname, selectedClass, email, emailVerification  } });
      }
      return (
        <div style={{ width: '120px'}}>
            <Story />
        </div>
      )}, withContactProvider, withFormDecorator],
} as Meta<typeof GradeDropDown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
    args: {
      message: 'Klasse',
      grades: ['5N', '6N', '7N', '7A', '7B', '8N', '8A', '8B', '9N', '9A', '9B', '10N', '10A', '10B', '11', '12'],
    },
};

export const SelectedGrade: Story = {
    parameters: {
      selectedClass: '7A',
    },
    args: {
      ...DefaultTest.args,
    },
};
