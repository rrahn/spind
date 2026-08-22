import { LockerModel } from "./LockerModel";

export type FloorPlanModel = {
    /** The level of the floor plan */
    level: number;
    /** The title of the floor plan */
    title: string;
    /** The image of the floor plan */
    image: string;
    /** The lockers on the floor plan */
    lockers: LockerModel[];
};
