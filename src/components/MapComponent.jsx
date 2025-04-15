import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as geotiff from "geotiff";
import proj4 from "proj4";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { polygonsRequest, polygonsDownload } from "../utils/polygonsRequest";

proj4.defs([["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"]]);

function MapComponent({ geotiffFile }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBounds, setImageBounds] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [drawingPolygonCoords, setDrawingPolygonCoords] = useState([]);
  const [polygonInstance, setPolygonInstance] = useState(null);
  const [polygonsCoords, setPolygonsCoords] = useState([]);
  const [polygonsVisible, setPolygonsVisible] = useState(true);

  const mapRef = useRef(null);
  const editControlRef = useRef(null);

  useEffect(() => {
    if (geotiffFile) {
      setLoading(true);
      loadGeoTiff(geotiffFile);
    } else {
      setImageUrl(null);
    }
  }, [geotiffFile]);

  async function loadGeoTiff(file) {
    try {
      const tiff = await geotiff.fromArrayBuffer(await file.arrayBuffer());
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const origin = image.getOrigin();
      const bbox = image.getBoundingBox();
      const samplesPerPixel = image.getSamplesPerPixel();

      const lat = origin[1];
      const lng = origin[0];
      mapRef.current.setView([lat, lng]);

      const data = await image.readRasters();

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const imageData = ctx.getImageData(0, 0, width, height);

      if (samplesPerPixel === 1) {
        for (let i = 0; i < data[0].length; i++) {
          const value = data[0][i];
          const index = i * 4;
          imageData.data[index] = value;
          imageData.data[index + 1] = value;
          imageData.data[index + 2] = value;
          imageData.data[index + 3] = 255;
        }
      } else if (samplesPerPixel === 3 || samplesPerPixel === 4) {
        for (let i = 0; i < width * height; i++) {
          const index = i * 4;
          imageData.data[index] = data[0][i];
          imageData.data[index + 1] = data[1][i];
          imageData.data[index + 2] = data[2][i];
          imageData.data[index + 3] = samplesPerPixel === 4 ? data[3][i] : 255;
        }
      } else {
        alert(`Неподдерживаемое количество каналов: ${samplesPerPixel}`);
        setLoading(false);
        return;
      }

      ctx.putImageData(imageData, 0, 0);
      const imageUrl = canvas.toDataURL("image/png");
      const bounds = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];

      setImageUrl(imageUrl);
      setImageBounds(bounds);
      setLoading(false);
    } catch (error) {
      console.error("Error loading GeoTIFF:", error);
      alert("Ошибка при загрузке GeoTIFF: " + error);
      setLoading(false);
    }
  }

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
    setPolygonsCoords(await polygonsRequest());

    console.log("Выделенный полигон", drawingPolygonCoords);
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
    if (polygonsCoords.length <= 0) {
      return;
    }
    polygonsDownload();
  }

  return (
    <div>
      {loading && <p className="load_massage">Загрузка...</p>}

      <button
        onClick={() => {
          setMapVisible(!mapVisible);
        }}
      >
        {mapVisible ? "Скрыть карту" : "Показать карту"}
      </button>

      <button onClick={handleGetCoordinates} style={drawingPolygonCoords.length > 0 ? {} : { display: "none" }}>Расчитать</button>

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

      <MapContainer
        center={[55.37, 86.06]}
        zoom={10}
        ref={mapRef}
        className="map_component"
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
        {imageUrl && <ImageOverlay url={imageUrl} bounds={imageBounds} />}
        {polygonsVisible &&
          convertedPoints.map((polygon, index) => (
            <Polygon key={index} positions={polygon} color="blue" />
          ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
