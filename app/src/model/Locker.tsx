
/** The type of the locker */
export enum LockerType {
  KEY,
  COMBINATION,
};

/** The position of the locker on the floor plan */
export type LockerPosition = {
  /** The x coordinate on the floor plan */
  x: number;
  /** The y coordinate on the floor plan */
  y: number;
};

/** The locker   */
export type Locker = {
    /** The id of the locker */
    id: number;
    /** The type of the locker */
    type: LockerType;
    /** The floor where the locker is located */
    floor: number;
    /** The location of the locker on the floor */
    location: LockerPosition;
};
