import { LockingMechanism } from "../model/LockerModel";
import LockerCompartment from "./LockerCompartment";
import { LockerCompartmentState } from "./LockerCompartment";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LockerCompartment> = {
  title: "Base/LockerCompartment",
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

export const AvailableCompartmentTest: Story = {
  args: {
    number: 5,
    lockType: LockingMechanism.KEY,
    isAvailable: true,
    isSelected: false,
    onClick: (n: number) => console.log(n),
  },
};

export const SelectedCompartmentTest: Story = {
  args: {
    ...AvailableCompartmentTest.args,
    isSelected: true,
  },
};

export const OccupiedCompartmentTest: Story = {
  args: {
    ...AvailableCompartmentTest.args,
    isAvailable: false,
  },
};
