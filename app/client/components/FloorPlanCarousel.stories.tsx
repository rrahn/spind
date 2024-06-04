import { StoryObj, Meta } from "@storybook/react";
import { http, HttpResponse } from "msw";

import FloorPlanCarousel from './FloorPlanCarousel';
import { LockerSelectionProvider } from "../contexts/LockerSelectionContext";

const meta = {
    title: 'Base/FloorPlanCarousel',
    component: FloorPlanCarousel,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
        <div style={{ width: '800px'}}>
          <LockerSelectionProvider>
            <Story />
          </LockerSelectionProvider>
        </div>
        ),
    ],
} as Meta<typeof FloorPlanCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const FirstFloor: Story = {
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
};
