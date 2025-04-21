import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { polygonsRequest, polygonsDownload } from "../utils/polygonsRequest";
import loadGeoTiff from "../utils/loadGeoTiff";

function MapComponent({ geotiffFile }) {
  const [imageUrl, setImageUrl] = useState();
  const [imageBounds, setImageBounds] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [substrateVisible, setSubstrateVisible] = useState(true);
  const [drawingPolygonCoords, setDrawingPolygonCoords] = useState([]);
  const [polygonInstance, setPolygonInstance] = useState();
  const [polygonsCoords, setPolygonsCoords] = useState([]);
  const [polygonsVisible, setPolygonsVisible] = useState(true);

  const mapRef = useRef();
  const editControlRef = useRef();

  useEffect(() => {
    if (geotiffFile && mapRef.current) {
      setLoading(true);
      loadGeoTiff(
        geotiffFile,
        setImageUrl,
        setImageBounds,
        setLoading,
        mapRef.current
      );
    } else {
      setImageUrl(null);
    }
  }, [geotiffFile]);

  const _onCreate = (e) => {
    if (e.layerType === "polygon") {
      if (polygonInstance) {
        mapRef.current.removeLayer(polygonInstance);
      }
      const { layer } = e;
      setDrawingPolygonCoords(
        layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng])
      );
      setPolygonInstance(layer);
    }

    if (editControlRef.current) {
      const polygonButton = editControlRef.current._toolbars[
        L.Draw.Event.CREATED
      ].querySelector(".leaflet-draw-draw-polygon");
      if (polygonButton) {
        polygonButton.classList.add("leaflet-disabled");
      }
    }
  };

  const _onEdited = (e) => {
    e.layers.eachLayer((layer) => {
      setDrawingPolygonCoords(
        layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng])
      );
      setPolygonInstance(layer);
    });
  };

  const _onDeleted = () => {
    setDrawingPolygonCoords([]);
    setPolygonInstance(null);

    if (editControlRef.current) {
      const polygonButton = editControlRef.current._toolbars[
        L.Draw.Event.CREATED
      ].querySelector(".leaflet-draw-draw-polygon");
      if (polygonButton) {
        polygonButton.classList.remove("leaflet-disabled");
      }
    }
  };

  const handleGetCoordinates = async () => {
    setLoading(true);
    setPolygonsCoords(await polygonsRequest(drawingPolygonCoords));
    setLoading(false);
  };

  const convertedPoints = polygonsCoords.map((polygon) => {
    return polygon.map((coord) => {
      if (coord[0] > 180 || coord[0] < -180) {
        return [coord[1], coord[0]];
      } else {
        return [coord[0], coord[1]];
      }
    });
  });

  function handleDownloa() {
    polygonsDownload(drawingPolygonCoords);
  }

  return (
    <div className="map_container">
      <div className="control">
        <div>
          <button
            onClick={() => {
              setMapVisible(!mapVisible);
            }}
          >
            {mapVisible ? "Скрыть карту" : "Показать карту"}
          </button>

          <button
            onClick={() => {
              setSubstrateVisible(!substrateVisible);
            }}
            style={imageUrl ? {} : { display: "none" }}
          >
            {substrateVisible ? "Скрыть подложку" : "Показать подложку"}
          </button>
        </div>

        <div>
          <button
            onClick={handleGetCoordinates}
            style={drawingPolygonCoords.length > 0 ? {} : { display: "none" }}
          >
            Расчитать
          </button>

          <button
            onClick={() => {
              setPolygonsVisible(!polygonsVisible);
            }}
            style={polygonsCoords.length > 0 ? {} : { display: "none" }}
          >
            {polygonsVisible ? "Скрыть полигоны" : "Показать полигоны"}
          </button>

          <button
            onClick={handleDownloa}
            style={polygonsCoords.length > 0 ? {} : { display: "none" }}
          >
            Скачать полигоны
          </button>
        </div>
      </div>

      {loading && <p className="load_massage">Загрузка...</p>}
      
      <p className="projection">Проекция: EPSG:4326 wgs84</p>

      <MapContainer
        center={[55.37, 86.06]}
        zoom={10}
        ref={mapRef}
        className="map_component"
        attributionControl={false}
      >
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreate}
            onEdited={_onEdited}
            onDeleted={_onDeleted}
            draw={{
              rectangle: false,
              polyline: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: true,
            }}
            ref={editControlRef}
          />
        </FeatureGroup>
        {mapVisible && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {imageUrl && substrateVisible && (
          <ImageOverlay url={imageUrl} bounds={imageBounds} />
        )}
        {polygonsVisible &&
          convertedPoints.map((polygon, index) => (
            <Polygon key={index} positions={polygon} color="blue" />
          ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
