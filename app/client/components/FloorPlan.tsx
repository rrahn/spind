import React, { useContext, useEffect, useRef, useState } from "react";
import ImageMapper, { CustomArea } from 'react-img-mapper';
import Locker from './Locker';
import LockerModalDialog from './LockerModalDialog';

import "./FloorPlan.css";
import { FloorMap } from "./FloorPlanCarousel";
import { LockerModel, LockingMechanism } from "./LockerModel";
import { LockerSelectionContext } from "../contexts/LockerSelectionContext";


export interface FloorPlanProps {
  /** The floor plan */
  floorPlan: FloorMap;
  /** The locker unit map */
  lockerUnitMap: LockerModel[];
  /** Whether this floor plan is selected and shall be shown */
  isSelected: boolean;
  /** The handler invoked when a locker is selected. */
  onSelectLocker?: () => void;
}

export default function FloorPlan({floorPlan, lockerUnitMap, isSelected, onSelectLocker} : FloorPlanProps) {

  const currentLocker = useContext(LockerSelectionContext);

  const imageMap = {
    name: floorPlan.title,
    areas: lockerUnitMap.map((locker) => {
        const selectedPrefillColor = (currentLocker.locker === locker.id) ? "rgb(244, 155, 30, 0.4)" : "rgb(38, 180, 184, 0.5)";
        return {
          "shape": "rect",
          "fillColor": "rgb(244, 155, 30)",
          "strokeColor": "rgb(0, 0, 0, 0.1)",
          "lineWidth": 0.1,
          "coords": locker.area,
          "preFillColor": selectedPrefillColor,
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
    const updateParentWidth = () => {
        if (parentRef.current && isSelected) {
          setParentWidth(parentRef.current.offsetWidth);
        }
    }

    // Set initial parent width value.
    updateParentWidth();

    // Create ResizeObserver instance
    const resizeObserver = new ResizeObserver(() => {
      updateParentWidth();
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    // setParentWidth((parentRef.current && isSelected) ? parentRef.current.offsetWidth : 0);
    console.log('Call effect with ' + parentWidth + ' setting new parentWidth to ' + parentRef.current?.offsetWidth + " for floor " + floorPlan.title);
    return () => {
      resizeObserver.disconnect();
      setParentWidth(0);
    }
  }, [isSelected, parentWidth]);

  let selectedLockerUnit = { id: -1, kind: LockingMechanism.KEY, area: [0, 0, 0, 0] } as LockerModel;
  if (selectedArea !== null) {
    selectedLockerUnit = lockerUnitMap[selectedArea];
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
          // console.log(area, index);
          setSelectedArea(index);
        }}/>
      {/* Show modal when an area on the image map was selected. */
        <LockerModalDialog
          openModal={selectedArea !== null}
          closeModal={() => setSelectedArea(null)}>
          <Locker key={selectedArea} id={selectedLockerUnit.id} onSelectLocker={onSelectLocker}/>
        </LockerModalDialog>
      }
    </div>
  );
}
