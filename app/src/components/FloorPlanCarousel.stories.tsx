import { StoryObj, Meta } from "@storybook/react";

import FloorPlanCarousel from './FloorPlanCarousel';

const meta = {
    title: 'Base/FloorPlanCarousel',
    component: FloorPlanCarousel,
    tags: ['autodocs'],
} as Meta<typeof FloorPlanCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstFloor: Story = {
};
