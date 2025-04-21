import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import {
  generateOrtoneiroplan,
  downloadOrtoneiroplan,
} from "../utils/generateNeiroplan";
import loadGeoTiff from "../utils/loadGeoTiff";

export default function MapOrtoneiroplan({ geotiffFile }) {
  const mapRef = useRef(null);
  const editControlRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [substrateVisible, setSubstrateVisible] = useState(true);
  const [drawingPolygonCoords, setDrawingPolygonCoords] = useState([]);
  const [polygonInstance, setPolygonInstance] = useState();

  const [imageUrl, setImageUrl] = useState();
  const [imageBounds, setImageBounds] = useState([
    [0, 0],
    [0, 0],
  ]);

  const [ortoneiroplanVisible, setOrtoneiroplanVisible] = useState(true);
  const [ortoneiroplanFile, setOrtoneiroplanFile] = useState();
  const [ortoneiroplanUrl, setOrtoneiroplanUrl] = useState();
  const [ortoneiroplanBounds, setOrtoneiroplanBounds] = useState([
    [0, 0],
    [0, 0],
  ]);

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

  useEffect(() => {
    if (ortoneiroplanFile) {
      setLoading(true);
      loadGeoTiff(
        ortoneiroplanFile,
        setOrtoneiroplanUrl,
        setOrtoneiroplanBounds,
        setLoading,
        mapRef.current
      );
    } else {
      setImageUrl(null);
    }
  }, [ortoneiroplanFile]);

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

  async function generateOrtoneiroplanHandler() {
    if (drawingPolygonCoords.length < 3) {
      return;
    }

    const neiroplan = await generateOrtoneiroplan(drawingPolygonCoords);
    if (neiroplan) {
      setOrtoneiroplanFile(neiroplan);
    }
  }

  function downloadOrtoneiroplanHandler() {
    if (drawingPolygonCoords.length < 3) {
      return;
    }

    downloadOrtoneiroplan(drawingPolygonCoords);
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
            onClick={generateOrtoneiroplanHandler}
            style={drawingPolygonCoords.length > 0 ? {} : { display: "none" }}
          >
            Сгенерировать
          </button>

          <button
            onClick={() => {
              setOrtoneiroplanVisible(!ortoneiroplanVisible);
            }}
            style={ortoneiroplanUrl ? {} : { display: "none" }}
          >
            {ortoneiroplanVisible
              ? "Скрыть ортонейроплан"
              : "Показать ортонейроплан"}
          </button>

          <button
            onClick={downloadOrtoneiroplanHandler}
            style={ortoneiroplanUrl ? {} : { display: "none" }}
          >
            {" "}
            Скачать ортонейроплан{" "}
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

        {ortoneiroplanUrl && ortoneiroplanVisible && (
          <ImageOverlay url={ortoneiroplanUrl} bounds={ortoneiroplanBounds} />
        )}
      </MapContainer>
    </div>
  );
}
