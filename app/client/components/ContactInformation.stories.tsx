import ContactInformation from "./ContactInformation";
import { StoryObj, Meta } from "@storybook/react";

const meta = {
    title: 'Base/ContactInformation',
    component: ContactInformation,
    tags: ['autodocs'],
} as Meta<typeof ContactInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
  args: {
    contactData: {
      forename: "John",
      surname: "Doe",
      email: "john.doe@mail.com",
      selectedClass: "5N",
    },
  }
};