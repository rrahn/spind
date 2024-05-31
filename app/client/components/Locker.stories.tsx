import type { Meta, StoryObj } from '@storybook/react'
import { http, HttpResponse, delay } from 'msw';


import Locker from "./Locker";
import { LockerSelectionProvider } from '../contexts/LockerSelectionContext';

const meta: Meta<typeof Locker> = {
    title: 'Base/Locker',
    component: Locker,
    decorators: [
        (Story) => (
          <LockerSelectionProvider>
            <Story />
          </LockerSelectionProvider>
        ),
    ],
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 👇 The mocked data that will be used in the story
const TestDataKeyLocker = [
    { id: 1, kind: 'key', state: 'Free' },
    { id: 2, kind: 'key', state: 'Free' },
    { id: 3, kind: 'key', state: 'Free' },
    { id: 4, kind: 'key', state: 'Free' },
    { id: 5, kind: 'key', state: 'Free' },
    { id: 6, kind: 'key', state: 'Free' },
    { id: 7, kind: 'key', state: 'Free' },
    { id: 8, kind: 'key', state: 'Free' },
    { id: 9, kind: 'key', state: 'Free' },
];

export const KeyLockerTest : Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/getLockers/unit/1', () => {
                    return HttpResponse.json(TestDataKeyLocker);
                }),
            ],
        },
    },
    args: {
        id: 1,
    },
};

const TestDataCombinationLocker = [
    { id: 1, kind: 'digit', state: 'Free' },
    { id: 2, kind: 'digit', state: 'Free' },
    { id: 3, kind: 'digit', state: 'Free' },
    { id: 4, kind: 'digit', state: 'Free' },
    { id: 5, kind: 'digit', state: 'Free' },
    { id: 6, kind: 'digit', state: 'Free' },
    { id: 7, kind: 'digit', state: 'Free' },
    { id: 8, kind: 'digit', state: 'Free' },
    { id: 9, kind: 'digit', state: 'Free' },
    { id: 10, kind: 'digit', state: 'Free' },
];

export const DigitLockerTest : Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/getLockers/unit/2', () => {
                    return HttpResponse.json(TestDataCombinationLocker);
                }),
            ],
        },
    },
    args: {
        id: 2,
    },
};
