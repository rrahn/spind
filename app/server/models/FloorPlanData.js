// import { FloorPlanModel } from './FloorPlanModel'; // Import the FloorPlanModel class
// import { LockerModel, LockingMechanism } from './LockerModel';
const path = require('path');
// const FloorPlanImgUri = path.resolve(__dirname, '../../assets/hwg-floor-plan.png');
// import {FloorPlanImgUri} from '../assets/hwg-floor-plan.png';
const FloorPlanImgUri = './assets/hwg-floor-plan.png';

// const areas = [
//     [63, 850, 204, 904], // 0
//     [214, 850, 358, 904], // 1
//     [624, 416, 677, 557], // 2
//     [694, 395, 842, 452], // 3
//     [859, 417, 913, 558], // 4
//     [973, 415, 1030, 560], // 5
//     [1050, 395, 1194, 452], // 6
//     [1211, 414, 1268, 558], // 7
//     [1507, 416, 1564, 560], // 8
//     [1581, 392, 1725, 449], // 9
//     [1745, 413, 1802, 558], // 10
//     [1859, 412, 1917, 560], // 11
//     [1937, 397, 2081, 450], // 12
//     [2098, 415, 2158, 556], // 13
// ];

const areas = [
    [64, 850, 204, 900], // 0
    [214, 850, 354, 900], // 1
    [624, 416, 674, 556], // 2
    [694, 395, 834, 445], // 3
    [860, 416, 910, 556], // 4
    [980, 416, 1030, 556], // 5
    [1050, 395, 1190, 445], // 6
    [1215, 416, 1265, 556], // 7
    [1510, 416, 1560, 556], // 8
    [1580, 395, 1720, 445], // 9
    [1745, 416, 1795, 556], // 10
    [1865, 416, 1915, 556], // 11
    [1936, 395, 2076, 445], // 12
    [2098, 416, 2148, 556], // 13
];

const floor0 = {
    "level": 0,
    "title": "Erdgeschoss",
    "image": FloorPlanImgUri,
    "lockers": [
        {
            id: 11,
            kind: 'KEY',
            area: areas[0]
        },
        {
            id: 12,
            kind: 'KEY',
            area: areas[1]
        },
        {
            id: 34,
            kind: 'COMBINATION',
            area: areas[2]
        },
        {
            id: 17,
            kind: 'KEY',
            area: areas[3]
        },
        {
            id: 1,
            kind: 'KEY',
            area: areas[4]
        },
        {
            id: 2,
            kind: 'KEY',
            area: areas[5]
        },
        {
            id: 14,
            kind: 'KEY',
            area: areas[6]
        },
        {
            id: 3,
            kind: 'KEY',
            area: areas[7]
        },
        {
            id: 4,
            kind: 'KEY',
            area: areas[8]
        },
        {
            id: 5,
            kind: 'KEY',
            area: areas[9]
        },
        {
            id: 10,
            kind: 'KEY',
            area: areas[10]
        },
        {
            id: 35,
            kind: 'COMBINATION',
            area: areas[11]
        }
    ]
};

const floor1 = {
    level: 1,
    title: '1. Stock',
    image: FloorPlanImgUri,
    lockers: [
        {
            id: 31,
            kind: 'KEY',
            area: areas[0]
        },
        {
            id: 18,
            kind: 'KEY',
            area: areas[1]
        },
        {
            id: 22,
            kind: 'KEY',
            area: areas[2]
        },
        {
            id: 6,
            kind: 'KEY',
            area: areas[4]
        },
        {
            id: 7,
            kind: 'KEY',
            area: areas[5]
        },
        {
            id: 8,
            kind: 'KEY',
            area: areas[6]
        },
        {
            id: 9,
            kind: 'KEY',
            area: areas[7]
        },
        {
            id: 28,
            kind: 'KEY',
            area: areas[8]
        },
        {
            id: 16,
            kind: 'KEY',
            area: areas[9]
        },
        {
            id: 29,
            kind: 'KEY',
            area: areas[10]
        },
        {
            id: 13,
            kind: 'KEY',
            area: areas[11]
        },
        {
            id: 30,
            kind: 'KEY',
            area: areas[13]
        }
    ]
};

const floor2 = {
    level: 2,
    title: '2. Stock',
    image: FloorPlanImgUri,
    lockers: [
        {
            id: 32,
            kind: 'KEY',
            area: areas[2]
        },
        {
            id: 33,
            kind: 'KEY',
            area: areas[4]
        },
        {
            id: 19,
            kind: 'KEY',
            area: areas[5]
        },
        {
            id: 20,
            kind: 'KEY',
            area: areas[6]
        },
        {
            id: 21,
            kind: 'KEY',
            area: areas[7]
        },
        {
            id: 23,
            kind: 'KEY',
            area: areas[8]
        },
        {
            id: 15,
            kind: 'KEY',
            area: areas[9]
        },
        {
            id: 24,
            kind: 'KEY',
            area: areas[10]
        },
        {
            id: 26,
            kind: 'KEY',
            area: areas[11]
        },
        {
            id: 27,
            kind: 'KEY',
            area: areas[13]
        }
    ]
};

module.exports = [floor0, floor1, floor2];
