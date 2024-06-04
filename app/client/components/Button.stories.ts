import { Meta, StoryObj } from "@storybook/react";

import "./Button.css"

import { Button } from "./Button";

const meta = {
    title: 'Base/Button',
    component: Button,
    tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultButton: Story = {
    args: {
        label: 'Default',
        onClick: () => console.log('Default clicked'),
    },
};

export const PrimaryButton: Story = {
    args: {
        ...DefaultButton.args,
        label: 'Primary',
        color: 'primary',
    },
}

export const SecondaryButton: Story = {
    args: {
        ...DefaultButton.args,
        label: 'Secondary',
        color: 'secondary',
    },
}

export const RoundButton: Story = {
    args: {
        ...DefaultButton.args,
        label: 'Round',
        shape: 'round',
    },
}

export const CircleButton: Story = {
    args: {
        ...DefaultButton.args,
        label: 'C',
        shape: 'circle',
    },
}
