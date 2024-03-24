import LockerCompartment from "./LockerCompartment";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LockerCompartment> = {
  title: "LockerCompartment",
  component: LockerCompartment,
  decorators: [
    (Story) => (
      <div style={{ width: '150px', height: '150px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LockerCompartment>;

export const DefaultTest: Story = {
  args: {
    number: 5,
    lockType: "key",
  },
};
