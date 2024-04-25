import type { Meta, StoryObj } from '@storybook/react'
import Locker from "./Locker";
import { LockingMechanism } from '../model/LockerModel';

const meta = {
    title: 'Base/Locker',
    component: Locker,
    tags: ['autodocs'],
} satisfies Meta<typeof Locker>;

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
