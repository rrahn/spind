import React, { useEffect, useState } from 'react';
import {CiSquareChevUp, CiSquareChevDown} from 'react-icons/ci';

import './FloorPlanCarousel.css';
import FloorPlan from './FloorPlan';
import { LockerModel } from './LockerModel';

export interface FloorMap {
  level: number;
  image: string;
  title: string;
}

export default function FloorPlanCarousel() {

  const [selectedFloorIdx, setSelectedFloorIdx] = useState(0);
  const [floorMaps, setFloorMaps] = useState<Array<FloorMap> | null>(null);
  const [lockerUnitMap, setLockerUnitMap] = useState<Array<LockerModel> | null>(null);

  useEffect(() => {
    console.log('Fetching floor maps from server...');

    const fetchData = async () => {
      // fetch the floorplan from the server with the selected floor index
      const response = await fetch('/api/getFloorMaps');
      const data = await response.json();
      console.log('Received floor maps: %j', data);
      setFloorMaps(data);
    };

    fetchData();

    return () => {
    };
  }, []);

  useEffect(() => {
    console.log('Fetching locker units for selected floor map from server...');

    const fetchData = async (floorId: number) => {
      // fetch the floorplan from the server with the selected floor index
      const response = await fetch('/api/getLockerUnits/floor/' + floorId);
      const data = await response.json();
      console.log('Received locker unit maps: %j', data);
      setLockerUnitMap(data);
    };

    fetchData(selectedFloorIdx + 1);

    return () => {
    };
  }, [selectedFloorIdx]);

  const maxFloorIdx = floorMaps ? floorMaps.length - 1 : 0;
  function handleClickNavUp() {
    setSelectedFloorIdx((selectedFloorIdx === maxFloorIdx) ? selectedFloorIdx : selectedFloorIdx + 1);
  }

  function handleClickNavDown() {
    setSelectedFloorIdx(selectedFloorIdx - 1);
  }

  const isUpDisabled = selectedFloorIdx === maxFloorIdx;
  const isDownDisabled = selectedFloorIdx === 0;

  let buttonUpClass = "floor-carousel__nav__button floor-carousel__nav__button--up";
  let buttonDownClass = "floor-carousel__nav__button floor-carousel__nav__button--down";
  buttonUpClass += isUpDisabled ? " floor-carousel__nav__button--disabled" : " floor-carousel__nav__button--enabled";
  buttonDownClass += isDownDisabled ? " floor-carousel__nav__button--disabled" : " floor-carousel__nav__button--enabled";

  function logLoading() {
    console.log('Loading component...');
    return true;
  }

  if (!floorMaps || !lockerUnitMap) {
    return (
    <div>
      <p>Loading...</p>
      {
        logLoading()
      }
    </div>
    )
  } else {
    return (
      <div>
        <p className='info-message'>Suchen sie sich einen Spind aus.</p>
        <div className="floor-carousel">
          {
            floorMaps.map((floorPlan, idx) =>
              <FloorPlan key={floorPlan.level} floorPlan={floorPlan} lockerUnitMap={lockerUnitMap} isSelected={selectedFloorIdx === idx}/>)
          }
          <div className="floor-carousel__nav">
              <CiSquareChevUp className={buttonUpClass}
                              onClick={handleClickNavUp}/>
              <CiSquareChevDown className={buttonDownClass}
                                onClick={handleClickNavDown}/>
          </div>
          <span>{floorMaps[selectedFloorIdx].title}</span>
        </div>
      </div>
    )
  }
}

if (module.hot) {
  module.hot.accept();
}
