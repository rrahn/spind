import { useState, useEffect, useRef } from 'react';
import {CiSquareChevUp, CiSquareChevDown} from 'react-icons/ci';

import './FloorPlanCarousel.css';
import { FloorPlanData } from "../model/FloorPlanData";
import FloorPlan from './FloorPlan';
import e from 'express';


export default function FloorPlanCarousel() {

  const [selectedFloorIdx, setSelectedFloorIdx] = useState(0);

  function handleClickNavUp() {
    setSelectedFloorIdx((selectedFloorIdx === FloorPlanData.length - 1) ? selectedFloorIdx : selectedFloorIdx + 1);
  }

  function handleClickNavDown() {
    setSelectedFloorIdx(selectedFloorIdx - 1);
  }

  const isUpDisabled = selectedFloorIdx === FloorPlanData.length - 1;
  const isDownDisabled = selectedFloorIdx === 0;

  let buttonUpClass = "floor-carousel__nav__button floor-carousel__nav__button--up";
  let buttonDownClass = "floor-carousel__nav__button floor-carousel__nav__button--down";
  buttonUpClass += isUpDisabled ? " floor-carousel__nav__button--disabled" : " floor-carousel__nav__button--enabled";
  buttonDownClass += isDownDisabled ? " floor-carousel__nav__button--disabled" : " floor-carousel__nav__button--enabled";

  return (
    <div>
      <p>FloorPlanCarousel</p>
      <div className="floor-carousel">
        {
          <FloorPlan key={selectedFloorIdx}
                     image={FloorPlanData[selectedFloorIdx].src}
                     idx={selectedFloorIdx}
                     isSelected={true}/>
          // FloorPlanData.map((image, idx) =>
          //   <FloorPlan key={idx} image={image.src} idx={idx} isSelected={selectedFloorIdx === idx}/>)
        }
        <div className="floor-carousel__nav">
            <CiSquareChevUp className={buttonUpClass}
                            onClick={handleClickNavUp}/>
            <CiSquareChevDown className={buttonDownClass}
                              onClick={handleClickNavDown}/>
        </div>
        <span>{FloorPlanData[selectedFloorIdx].alt}</span>
      </div>
    </div>
  )
}
