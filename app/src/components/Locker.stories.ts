import type { Meta, StoryObj } from '@storybook/react'
import Locker from "./Locker";

const meta = {
    title: 'Base/Locker',
    component: Locker,
    tags: ['autodocs'],
} satisfies Meta<typeof Locker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest = {
    args: {
        id: '1.4',
    },
} satisfies Story;
