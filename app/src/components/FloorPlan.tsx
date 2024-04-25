import React, { useEffect, useRef, useState } from "react";
import ImageMapper, { AreaEvent, CustomArea } from 'react-img-mapper';
import Locker from './Locker';
import LockerModalDialog from './LockerModalDialog';

import "./FloorPlan.css";
import { FloorPlanModel } from "../model/FloorPlanModel";
import { LockerModel, LockingMechanism } from "../model/LockerModel";


export interface FloorPlanProps {
  /** The floor plan */
  floorPlan: FloorPlanModel;
  /** Whether this floor plan is selected and shall be shown */
  isSelected: boolean;
}

export default function FloorPlan({floorPlan, isSelected} : FloorPlanProps) {

  const imageMap = {
    name: floorPlan.title,
    areas: floorPlan.lockers.map((locker) => {
        return {
          "shape": "rect",
          "fillColor": "rgb(244, 155, 30)",
          "strokeColor": "rgb(0, 0, 0, 0.1)",
          "lineWidth": 0.1,
          "coords": locker.area,
          "preFillColor": "rgb(38, 180, 184, 0.5)",
          // Following states need to be set based on how many compartments are available
          // "active": false,
          // "disabled": true,
        };
      }),
  };

  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  /**
   * Set the parent width when the component is mounted and when the current floor is selected by the parent component.
   * Setting the parent width as a state to cause another render, this time with the correct parent width.
   * When the component mounts the DOM element does not exist yet, so the parent width is set to 0.
   * The parent width is set also to 0 when the floor is not selected.
   *
   * @returns void
   */
  useEffect(() => {
    setParentWidth((parentRef.current && isSelected) ? parentRef.current.offsetWidth : 0);
    console.log('Call effect with ' + parentWidth + ' setting new parentWidth to ' + parentRef.current?.offsetWidth + " for floor " + floorPlan.title);
    return () => setParentWidth(0);
  }, [isSelected]);

  let selectedLocker = { id: -1, kind: LockingMechanism.KEY, area: [0, 0, 0, 0] } as LockerModel;
  if (selectedArea !== null) {
    selectedLocker = floorPlan.lockers[selectedArea];
  }

  return (
    <div ref={parentRef} key={floorPlan.level} className={isSelected ? "floor-image" : "floor-image floor-image--hidden"} >
      <ImageMapper
        key={floorPlan.level}
        src={floorPlan.image}
        map={imageMap}
        responsive={true}
        parentWidth={parentWidth}
        onClick={(area: CustomArea, index: number) => {
          console.log(area, index);
          setSelectedArea(index);
        }}/>
      {/* Show modal when an area on the image map was selected. */
        <LockerModalDialog
          openModal={selectedArea !== null}
          closeModal={() => setSelectedArea(null)}
          children={<Locker key={selectedArea} id={selectedLocker.id} lockType={selectedLocker.kind}/>}
        />
      }
    </div>
  );
}
