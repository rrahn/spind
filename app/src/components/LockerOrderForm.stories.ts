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

    await step('Fill in pupil information', async () => {
      await userEvent.type(canvas.getByLabelText('Vorname'), 'John');
      await userEvent.type(canvas.getByLabelText('Nachname'), 'Doe');
      await userEvent.selectOptions(canvas.getByTestId('input-class'), '8N');
    });

    await step('Fill in contact mail', async () => {
      const emailFields = canvas.getAllByLabelText('Email', { exact: false });
      await waitFor(() => expect(emailFields).toHaveLength(2));
      await userEvent.type(emailFields[0], 'john.doe@mail.com');
      await userEvent.type(emailFields[1], 'john.doe@mail.com');
    });

    await step('Submit form', async () => {
      await fireEvent.click(canvas.getByText('Submit'));
    });

    await waitFor(() => expect(args.handleSubmit).toHaveBeenCalled());
  }
};
