
/** The type of the locker */
export enum LockingMechanism {
  KEY = 'key',
  COMBINATION = 'digit',
};

/** The locker   */
export type LockerModel = {
    /** The id of the locker */
    id: number;
    /** The kind of the locker */
    kind: LockingMechanism;
    /** The location of the locker on the respective floor */
    area: number[];
};
