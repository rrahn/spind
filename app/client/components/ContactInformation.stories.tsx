import { useForm, FormProvider } from "react-hook-form";
import ContactInformation from "./ContactInformation";
import { StoryObj, Meta } from "@storybook/react";

const withFormDecorator = (Story: any) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Story />
    </FormProvider>
  );
};

const meta = {
    title: 'Base/ContactInformation',
    component: ContactInformation,
    tags: ['autodocs'],
    decorators: [withFormDecorator],
} as Meta<typeof ContactInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
  args: {
    contactData: {
      forename: "John",
      surname: "Doe",
      email: "john.doe@mail.com",
      emailVerification: "john.doe@mail.com",
      selectedClass: "5N",
    },
  }
};
