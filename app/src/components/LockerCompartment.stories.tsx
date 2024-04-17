import LockerCompartment from "./LockerCompartment";
import { LockerCompartmentState } from "./LockerCompartment";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LockerCompartment> = {
  title: "LockerCompartment",
  component: LockerCompartment,
  decorators: [
    (Story) => (
      <div style={{ width: '100px'}}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LockerCompartment>;

export const FreeCompartmentTest: Story = {
  args: {
    number: 5,
    lockType: "key",
    state: LockerCompartmentState.FREE,
  },
};

export const ReservedCompartmentTest: Story = {
  args: {
    ...FreeCompartmentTest.args,
    state: LockerCompartmentState.RESERVED,
  },
};

export const AssignedCompartmentTest: Story = {
  args: {
    ...FreeCompartmentTest.args,
    state: LockerCompartmentState.ASSIGNED,
  },
};
