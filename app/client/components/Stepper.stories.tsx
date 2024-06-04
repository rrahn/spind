import { Meta, StoryObj } from "@storybook/react";
import Stepper from "./Stepper";

const meta = {
  title: 'Base/Stepper',
  component: Stepper,
  tags: ['autodocs'],
} as Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  args: {
    currentStep: 0,
    totalSteps: 5,
  }
};

export const MiddleStep: Story = {
  args: {
    currentStep: 2,
    totalSteps: 5,
  }
};

export const LastStep: Story = {
  args: {
    currentStep: 4,
    totalSteps: 5,
  }
};
