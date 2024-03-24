import React, { useEffect, useRef, useState } from "react";
import ImageMapper from 'react-img-mapper';

import "./FloorPlan.css";


export interface FloorPlanProps {
  /** The image of the floor plan */
  image: string;
}

export default function FloorPlan({image, ...props} : FloorPlanProps) {

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
    name: "floor-plan",
    areas: coordinates.map((area, idx) => {
        return {
          "title": `Locker ${idx + 1}`,
          "shape": "rect",
          "name": `locker ${idx + 1}`,
          "fillColor": "#eab54d4d",
          "strokeColor": "black",
          "coords": area,
        };
      }),
  };

  const [floorPlanWidth, setFloorPlanWidth] = useState(0);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.log('width', ref.current ? ref.current.offsetWidth : 0);
    setFloorPlanWidth(ref.current ? ref.current.offsetWidth : 0);
  }, [ref.current]);

  return (
    <div className='map-container' ref={ref}>
      <ImageMapper src={image} map={imageMap} responsive={true} parentWidth={floorPlanWidth} />
    </div>
  );
}
