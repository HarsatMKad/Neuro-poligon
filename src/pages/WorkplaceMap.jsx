import OrtoneiroplanMap from "../components/OrtoNeiroPlanMap";
import GeneratePolygonMap from "../components/GeneratePolygonMap";
import HeaderMain from "../components/Header";
import { useState } from "react";

export default function WorkplaceMap() {
  const [mapType, setMapType] = useState(false);

  return (
    <div>
      <HeaderMain currentSection={3} />
      <div className="mapComponent">
        <div className="selectMapTypeSection">
          <button
            style={mapType ? { background: "white", color: "black" } : {}}
            onClick={() => setMapType(true)}
          >
            Генерация полигонов
          </button>
          <button
            style={mapType ? {} : { background: "white", color: "black" }}
            onClick={() => setMapType(false)}
          >
            Создание ортонейроплана
          </button>
        </div>
        {mapType ? <OrtoneiroplanMap /> : <GeneratePolygonMap />}
      </div>
    </div>
  );
}
