import { Meta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within, expect, fn, fireEvent } from "@storybook/test";
import { http, HttpResponse } from "msw";

import LockerOrderForm from "./LockerOrderForm";

const floorMaps = [
  { level: 1, image: './hwg-floor-plan-eg.png', title: 'Erdgeschoss' },
  { level: 2, image: './hwg-floor-plan-1g.png', title: '1. Stock' },
];

const lockerUnitsOnFirstFloor = [
  { id: 1, kind: 'key', area: [860, 416, 910, 556] },
  { id: 2, kind: 'key', area: [980, 416, 1030, 556] },
  { id: 1, kind: 'key', area: [1215, 416, 1265, 556] },
  { id: 2, kind: 'key', area: [1510, 416, 1560, 556] },
  { id: 1, kind: 'key', area: [1580, 395, 1720, 445] },
  { id: 1, kind: 'key', area: [1745, 416, 1795, 556] },
  { id: 1, kind: 'key', area: [64, 850, 204, 900] },
  { id: 2, kind: 'key', area: [214, 850, 354, 900] },
  { id: 2, kind: 'key', area: [1050, 395, 1190, 445] },
  { id: 2, kind: 'key', area: [694, 395, 834, 445] },
  { id: 1, kind: 'key', area: [624, 416, 674, 556] },
  { id: 2, kind: 'key', area: [1865, 416, 1915, 556] },
];

const lockerUnitsOnSecondFloor = [
  { id: 1, kind: 'key', area: [860, 416, 910, 556] },
  { id: 1, kind: 'key', area: [980, 416, 1030, 556] },
  { id: 1, kind: 'key', area: [1050, 395, 1190, 445] },
  { id: 1, kind: 'key', area: [1215, 416, 1265, 556] },
  { id: 1, kind: 'key', area: [1865, 416, 1915, 556] },
  { id: 1, kind: 'key', area: [1580, 395, 1720, 445] },
  { id: 2, kind: 'key', area: [214, 850, 354, 900] },
  { id: 2, kind: 'key', area: [624, 416, 674, 556] },
  { id: 2, kind: 'key', area: [1510, 416, 1560, 556] },
  { id: 2, kind: 'key', area: [1745, 416, 1795, 556] },
  { id: 2, kind: 'key', area: [2098, 416, 2148, 556] },
  { id: 2, kind: 'key', area: [64, 850, 204, 900] },
];

const meta = {
    title: 'Page/LockerOrderForm',
    component: LockerOrderForm,
    parameters: {
      msw: {
          handlers: {
              carousel: [
                  http.get('/api/getFloorMaps', () => {
                      return HttpResponse.json(floorMaps);
                  }),
                  http.get('/api/getLockerUnits/floor/1', () => {
                      return HttpResponse.json(lockerUnitsOnFirstFloor);
                  }),
                  http.get('/api/getLockerUnits/floor/2', () => {
                      return HttpResponse.json(lockerUnitsOnSecondFloor);
                  }),
              ],
          },
      },
    },
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
      await userEvent.click(canvas.getByTestId('t1'));
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
