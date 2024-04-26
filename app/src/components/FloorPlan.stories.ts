import FloorPlan from "./FloorPlan";
import { Meta, StoryObj } from "@storybook/react";

import exp from "constants";
import { FloorPlanData } from "../model/FloorPlanData";

const meta = {
    title: 'Base/FloorPlan',
    component: FloorPlan,
    tags: ['autodocs'],
} as Meta<typeof FloorPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    floorPlan: FloorPlanData[0],
    isSelected: true,
  },
};
