import { Meta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within, expect, fn, fireEvent } from "@storybook/test";

import LockerOrderForm from "./LockerOrderForm";

const meta = {
    title: 'Form/LockerOrderForm',
    component: LockerOrderForm,
    args: {
      handleSubmit: fn(),
    },
    tags: ['autodocs'],
} as Meta<typeof LockerOrderForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyForm: Story = {
};

export const FillingForm: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Fill in the form', async () => {
      await userEvent.type(canvas.getByLabelText('Vorname'), 'John');
      await userEvent.type(canvas.getByLabelText('Nachname'), 'Doe');
      await userEvent.selectOptions(canvas.getByTestId('input-class'), '8N');
      await userEvent.type(canvas.getByTestId('email'), 'john.doe@mail.com');
    });

    await step('Submit form', async () => {
      await fireEvent.click(canvas.getByText('Submit'));
    });

    await waitFor(() => expect(args.handleSubmit).toHaveBeenCalled());
  }
};
