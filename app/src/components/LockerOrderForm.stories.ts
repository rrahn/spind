import LockerOrderForm from "./LockerOrderForm";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
    title: 'Form/LockerOrderForm',
    component: LockerOrderForm,
    tags: ['autodocs'],
} as Meta<typeof LockerOrderForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
    args: {
      grades: ['5N', '6N', '7N', '7A', '7B', '8N', '8A', '8B', '9N', '9A', '9B', '10N', '10A', '10B', '11', '12'],
    },
};
