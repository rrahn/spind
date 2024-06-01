import GradeDropDown from "./GradeDropDown";

import { Meta, StoryObj } from "@storybook/react";

const meta = {
    title: 'Base/GradeDropDown',
    component: GradeDropDown,
    tags: ['autodocs'],
} as Meta<typeof GradeDropDown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTest: Story = {
    args: {
      message: 'Klasse',
      grades: ['5N', '6N', '7N', '7A', '7B', '8N', '8A', '8B', '9N', '9A', '9B', '10N', '10A', '10B', '11', '12'],
    },
};
