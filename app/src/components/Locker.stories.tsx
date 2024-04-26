import type { Meta, StoryObj } from '@storybook/react'
import Locker from "./Locker";
import { LockingMechanism } from '../model/LockerModel';
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

export const KeyLockerTest : Story = {
    args: {
        id: 10,
        lockType: LockingMechanism.KEY,
    },
};

export const DigitLockerTest : Story = {
    args: {
        ...KeyLockerTest.args,
        lockType: LockingMechanism.COMBINATION,
    },
};
