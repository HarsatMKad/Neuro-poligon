import { Map, View } from "ol"
import { OSM, Source } from "ol/source"
import TileLayer from "ol/layer/Tile"
import { useEffect, useRef } from "react"

export default function MapNeiroplan() {
    const mapObj = useRef();

    useEffect(()=>{
      if(!mapObj.current){
        return
      }
  
      const map = new Map({
        target: mapObj.current,
        layers: [
          new TileLayer({source: new OSM()})
        ],
        view: new View({center:[4190701, 7511438], zoom: 10})
      })
      
      return () => {
        map.setTarget(undefined);
      }
    })
  
    return (
      <div className="mapObject" ref={mapObj}>
        
      </div>
    )
}