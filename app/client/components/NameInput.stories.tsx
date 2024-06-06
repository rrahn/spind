import NameInput from "./NameInput";
import { StoryObj, Meta } from "@storybook/react";
import { FormProvider, useForm } from "react-hook-form";

const withFormDecorator = (Story: any) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Story />
    </FormProvider>
  );
};

const meta = {
    title: 'Base/NameInput',
    component: NameInput,
    tags: ['autodocs'],
    decorators: [withFormDecorator],
} as Meta<typeof NameInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
    args: {
      inputId: 'name',
      inputLabel: 'Name',
      inputType: 'text',
    },
};

export const SetTextInput: Story = {
  args: {
    inputValue: 'John Doe',
    ...TextInput.args,
  },
};

export const EmailInput: Story = {
  args: {
    ...TextInput.args,
    inputType: 'email',
    inputLabel: 'Email',
  },
};

export const SetValidEmail: Story = {
  args: {
    ...EmailInput.args,
    inputValue: 'test@mail.com'
  },
};

export const SetInvalidEmail: Story = {
  args: {
    ...EmailInput.args,
    inputValue: 'test123mail.com'
  },
};
