
import { FloorPlanModel } from './FloorPlanModel'; // Import the FloorPlanModel class
import { LockerModel, LockingMechanism } from './LockerModel';

const areas: number[][] = [
  [63,850,204,904],     // 0
  [214,850,358,904],    // 1
  [624,416,677,557],    // 2
  [694,395,842,452],    // 3
  [859,417,913,558],    // 4
  [973,415,1030,560],   // 5
  [1050,395,1194,452],  // 6
  [1211,414,1268,558],  // 7
  [1507,416,1564,560],  // 8
  [1581,392,1725,449],  // 9
  [1745,413,1802,558],  // 10
  [1859,412,1917,560],  // 11
  [1937,397,2081,450],  // 12
  [2098,415,2158,556],  // 13
];

const floor0: FloorPlanModel = {
  level: 0,
  title: "Erdgeschoss",
  image: "./hwg-floor-plan.png",
  lockers: [
    {
      id: 11,
      kind: LockingMechanism.KEY,
      area: areas[0],
    } as LockerModel,
    {
      id: 12,
      kind: LockingMechanism.KEY,
      area: areas[1],
    } as LockerModel,
    {
      id: 34,
      kind: LockingMechanism.COMBINATION,
      area: areas[2],
    } as LockerModel,
    {
      id: 17,
      kind: LockingMechanism.KEY,
      area: areas[3],
    } as LockerModel,
    {
      id: 1,
      kind: LockingMechanism.KEY,
      area: areas[4],
    } as LockerModel,
    {
      id: 2,
      kind: LockingMechanism.KEY,
      area: areas[5],
    } as LockerModel,
    {
      id: 14,
      kind: LockingMechanism.KEY,
      area: areas[6],
    } as LockerModel,
    {
      id: 3,
      kind: LockingMechanism.KEY,
      area: areas[7],
    } as LockerModel,
    {
      id: 4,
      kind: LockingMechanism.KEY,
      area: areas[8],
    } as LockerModel,
    {
      id: 5,
      kind: LockingMechanism.KEY,
      area: areas[9],
    } as LockerModel,
    {
      id: 10,
      kind: LockingMechanism.KEY,
      area: areas[10],
    } as LockerModel,
    {
      id: 35,
      kind: LockingMechanism.COMBINATION,
      area: areas[11],
    } as LockerModel,
  ],
};

const floor1: FloorPlanModel = {
  level: 1,
  title: "1. Stock",
  image: "./hwg-floor-plan.png",
  lockers: [
    {
      id: 31,
      kind: LockingMechanism.KEY,
      area: areas[0],
    } as LockerModel,
    {
      id: 18,
      kind: LockingMechanism.KEY,
      area: areas[1],
    } as LockerModel,
    {
      id: 22,
      kind: LockingMechanism.KEY,
      area: areas[2],
    } as LockerModel,
    {
      id: 6,
      kind: LockingMechanism.KEY,
      area: areas[4],
    } as LockerModel,
    {
      id: 7,
      kind: LockingMechanism.KEY,
      area: areas[5],
    } as LockerModel,
    {
      id: 8,
      kind: LockingMechanism.KEY,
      area: areas[6],
    } as LockerModel,
    {
      id: 9,
      kind: LockingMechanism.KEY,
      area: areas[7],
    } as LockerModel,
    {
      id: 28,
      kind: LockingMechanism.KEY,
      area: areas[8],
    } as LockerModel,
    {
      id: 16,
      kind: LockingMechanism.KEY,
      area: areas[9],
    } as LockerModel,
    {
      id: 29,
      kind: LockingMechanism.KEY,
      area: areas[10],
    } as LockerModel,
    {
      id: 13,
      kind: LockingMechanism.KEY,
      area: areas[11],
    } as LockerModel,
    {
      id: 30,
      kind: LockingMechanism.KEY,
      area: areas[13],
    } as LockerModel,
  ],
};

const floor2: FloorPlanModel = {
  level: 2,
  title: "2. Stock",
  image: "./hwg-floor-plan.png",
  lockers: [
    {
      id: 32,
      kind: LockingMechanism.KEY,
      area: areas[2],
    } as LockerModel,
    {
      id: 33,
      kind: LockingMechanism.KEY,
      area: areas[4],
    } as LockerModel,
    {
      id: 19,
      kind: LockingMechanism.KEY,
      area: areas[5],
    } as LockerModel,
    {
      id: 20,
      kind: LockingMechanism.KEY,
      area: areas[6],
    } as LockerModel,
    {
      id: 21,
      kind: LockingMechanism.KEY,
      area: areas[7],
    } as LockerModel,
    {
      id: 23,
      kind: LockingMechanism.KEY,
      area: areas[8],
    } as LockerModel,
    {
      id: 15,
      kind: LockingMechanism.KEY,
      area: areas[9],
    } as LockerModel,
    {
      id: 24,
      kind: LockingMechanism.KEY,
      area: areas[10],
    } as LockerModel,
    {
      id: 26,
      kind: LockingMechanism.KEY,
      area: areas[11],
    } as LockerModel,
    {
      id: 27,
      kind: LockingMechanism.KEY,
      area: areas[13],
    } as LockerModel,
  ],
};

export const FloorPlanData = [floor0, floor1, floor2];
