import React, { useEffect, useRef, useState } from "react";
import ImageMapper, { AreaEvent, CustomArea } from 'react-img-mapper';
import Locker from './Locker';
import LockerModalDialog from './LockerModalDialog';

import "./FloorPlan.css";


export interface FloorPlanProps {
  /** The index of the floor plan */
  idx: number;
  /** The image of the floor plan */
  image: string;
  /** Whether this floor plan is selected and shall be displayed */
  isSelected: boolean;
}

export default function FloorPlan({idx, image, isSelected} : FloorPlanProps) {

  const coordinates = [
    [63,848,204,904],
    [214,850,358,904],
    [624,416,677,557],
    [694,395,842,452],
    [859,417,913,558],
    [973,415,1030,560],
    [1050,395,1194,452],
    [1211,414,1268,558],
    [1507,416,1564,560],
    [1581,392,1725,449],
    [1745,413,1802,558],
    [1859,412,1917,560],
    [1937,397,2081,450],
    [2098,415,2158,556],
  ];

  const imageMap = {
    name: "floor-plan-" + idx.toString(),
    areas: coordinates.map((area, idx) => {
        return {
          "shape": "rect",
          "fillColor": "rgb(244, 155, 30)",
          "strokeColor": "rgb(0, 0, 0, 0.1)",
          "lineWidth": 0.1,
          "coords": area,
          "preFillColor": "rgb(38, 180, 184, 0.5)",
          // Following states need to be set based on how many compartments are available
          // "active": false,
          // "disabled": true,
        };
      }),
  };

  const [selectedLocker, setSelectedLocker] = useState<number>(0);
  const [parentWidth, setParentWidth] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParentWidth(parentRef.current  ? parentRef.current.offsetWidth : 0);
    console.log('Call effect with ' + parentWidth + ' setting new parentWidth to ' + parentRef.current?.offsetWidth);
  }, [parentRef.current?.offsetWidth]);

  console.log('Render floor: ' + idx + ' with parentWidth: ' + parentWidth);

  return (
    <div ref={parentRef} key={idx} className={isSelected ? "floor-image" : "floor-image floor-image--hidden"} >
      <ImageMapper
        key={idx}
        src={image}
        map={imageMap}
        responsive={true}
        parentWidth={parentWidth}
        onClick={(area: CustomArea, index: number) => {
          console.log(area, index);
          setSelectedLocker(index + 1);
        }}/>
      {/* Show modal when selected Locker is greater than 0 */
        <LockerModalDialog
          openModal={selectedLocker > 0}
          closeModal={() => setSelectedLocker(0)}
          children={<Locker key={selectedLocker} id={selectedLocker} lockerType="key"/>}
        />
      }
    </div>
  );
}
