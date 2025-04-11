import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as geotiff from "geotiff";
import proj4 from "proj4";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

proj4.defs([["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"]]);

function MapComponent({ geotiffFile }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBounds, setImageBounds] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [loading, setLoading] = useState(false);
  const [crsCode, setCrsCode] = useState(null);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [polygonInstance, setPolygonInstance] = useState(null);

  const mapRef = useRef(null);
  const editControlRef = useRef(null);

  useEffect(() => {
    if (geotiffFile) {
      setLoading(true);
      loadGeoTiff(geotiffFile);
    }
  }, [geotiffFile]);

  async function loadGeoTiff(file) {
    // ... (оставьте вашу функцию loadGeoTiff без изменений)
    try {
      const tiff = await geotiff.fromArrayBuffer(await file.arrayBuffer());
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const origin = image.getOrigin();
      const resolution = image.getResolution();
      const geoKeys = image.getGeoKeys();
      const bbox = image.getBoundingBox();
      const samplesPerPixel = image.getSamplesPerPixel(); // Получаем количество каналов

      console.log("GeoTIFF Metadata:", {
        width,
        height,
        origin,
        resolution,
        geoKeys,
        bbox,
        samplesPerPixel,
      });

      // Проверяем наличие проекции и ее поддерживаемость
      let currentCrsCode = null; // Локальная переменная для хранения кода проекции
      if (geoKeys.ProjectedCSTypeGeoKey) {
        currentCrsCode = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`; // Получаем код проекции

        try {
          proj4.defs([[currentCrsCode, geoKeys.PROJCS || ""]]);
          console.log("Projection loaded from GeoTIFF:", currentCrsCode);
        } catch (error) {
          console.error("Error defining projection:", error);
          alert("Не удалось определить проекцию.");
          setLoading(false);
          return;
        }
      }

      setCrsCode(currentCrsCode); // Сохраняем код проекции в состояние

      // Получаем данные растра
      const data = await image.readRasters();

      // Создаем canvas для отображения растра
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Заполняем canvas данными растра (пример для одноканального и многоканального GeoTIFF)
      const imageData = ctx.getImageData(0, 0, width, height);

      if (samplesPerPixel === 1) {
        // Одноканальное изображение (оттенки серого)
        for (let i = 0; i < data[0].length; i++) {
          const value = data[0][i]; // Значение пикселя
          const index = i * 4; // Индекс в imageData (R, G, B, A)
          imageData.data[index] = value; // R
          imageData.data[index + 1] = value; // G
          imageData.data[index + 2] = value; // B
          imageData.data[index + 3] = 255; // A (полная прозрачность)
        }
      } else if (samplesPerPixel === 3 || samplesPerPixel === 4) {
        // Многоканальное изображение (RGB или RGBA)
        for (let i = 0; i < width * height; i++) {
          const index = i * 4;
          imageData.data[index] = data[0][i]; // R
          imageData.data[index + 1] = data[1][i]; // G
          imageData.data[index + 2] = data[2][i]; // B
          imageData.data[index + 3] = samplesPerPixel === 4 ? data[3][i] : 255; // A
        }
      } else {
        alert(`Неподдерживаемое количество каналов: ${samplesPerPixel}`);
        setLoading(false);
        return;
      }

      ctx.putImageData(imageData, 0, 0);

      // Создаем URL для canvas
      const imageUrl = canvas.toDataURL("image/png");

      // Определяем границы изображения на карте
      let bounds;
      if (crsCode) {
        // Если проекция известна, переводим координаты углов
        const topLeft = proj4(crsCode, "EPSG:4326", [bbox[0], bbox[3]]);
        const bottomRight = proj4(crsCode, "EPSG:4326", [bbox[2], bbox[1]]);
        bounds = [
          [topLeft[1], topLeft[0]],
          [bottomRight[1], bottomRight[0]],
        ]; // Leaflet использует [широта, долгота]
      } else {
        // Если проекция неизвестна, используем дефолтные значения (может быть смещение)
        bounds = [
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]],
        ];
        alert(
          "Предупреждение: Проекция GeoTIFF не определена.  Изображение может быть смещено."
        );
      }

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
      setPolygonCoords(
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
      setPolygonCoords(
        layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng])
      );
      setPolygonInstance(layer);
    });
  };

  const _onDeleted = () => {
    setPolygonCoords([]);
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

  const handleGetCoordinates = () => {
    console.log("Polygon Coordinates:", polygonCoords);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      <button onClick={handleGetCoordinates}>Get Polygon Coordinates</button>
      <MapContainer
        center={[55.357, 86.083]}
        zoom={10}
        style={{ height: "1000px", width: "100%" }}
        ref={mapRef}
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {imageUrl && <ImageOverlay url={imageUrl} bounds={imageBounds} />}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
