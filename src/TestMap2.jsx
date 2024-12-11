import React, { useState, useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import { fromLonLat } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import { Polygon } from "ol/geom";
import { Feature } from "ol";

const MapComponent = () => {
  const mapRef = useRef();
  const [polygonPoints, setPolygonPoints] = useState();
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
  const polygonsSourceRef = useRef(new VectorSource());
  const [map, setMap] = useState(null);
  const [baseLayerType, setBaseLayerType] = useState(false);

  const polygonStyle = new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  });

  function startDrawingPolygon() {
    if (drawInteractionRef.current) {
      //return;
    }

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: polygonStyle,
    });

    map.addLayer(vectorLayer);

    vectorSourceRef.current.clear();

    const draw = new Draw({
      type: "Polygon",
      source: vectorSourceRef.current,
    });

    draw.on("drawend", function (event) {
      console.log(
        "Полигон нарисован:",
        event.feature.getGeometry().getCoordinates()
      );

      setPolygonPoints(event.feature.getGeometry().getCoordinates());
      //stopDrawingPolygon(); функция для прекращения рисования после завершения одного полигона
    });

    map.addInteraction(draw);
    drawInteractionRef.current = draw;
  }

  function loadRastrImg() {
    if (!polygonPoints || !Array.isArray(polygonPoints)) {
      alert("Сначала нарисуйте полигон!");
      return;
    }

    const coordinates = polygonPoints[0];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < coordinates.length; i++) {
      const point = coordinates[i];
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    }

    const imageExtent = [minX, minY, maxX, maxY]; // границы растрового изображения
    console.log(imageExtent);
    const staticSource = new Static({
      url: "./public/poligon_show_img1.jpg", // Путь к вашему растровому изображению
      imageSize: [maxX - minX, maxY - minY], // Размер изображения
      projection: "EPSG:3857",
      imageExtent: imageExtent,
    });

    const imageLayer = new ImageLayer({
      extent: imageExtent,
      source: staticSource,
    });

    map.addLayer(imageLayer);
  }

  function clearRastrImg() {
    const layersToRemove = [];

    map.getLayers().forEach((layer) => {
      if (layer instanceof ImageLayer) {
        layersToRemove.push(layer); // Сохраняем ссылки на слои с растрами
      }
    });

    layersToRemove.forEach((layer) => {
      map.removeLayer(layer);
    });
  }

  function stopDrawingPolygon() {
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
  }

  function clearPolygons() {
    vectorSourceRef.current.clear();
  }

  useEffect(() => {
    const rasterLayer = new TileLayer({
      source: new OSM(),
    });

    const view = new View({
      center: fromLonLat([37.6173, 55.7558]), // Москва        wgs86 псевдомеркатер, для нашего региона wgs 86 45n
      zoom: 10,
    });

    const imageSource = new Static({
      url: "./public/poligon_show_img1.jpg", // Укажите путь к вашему изображению
      projection: "EPSG:3857",
      imageExtent: [
        4116146.4965994544, 7492221.751775933, 4175767.3786618924,
        7504757.424414702,
      ], // Координаты области покрытия изображения
    });

    const imageLayer = new ImageLayer({
      source: imageSource,
    });

    const newMap = new Map({
      layers: [imageLayer],
      target: mapRef.current,
      controls: [],
      view: view,
    });

    setBaseLayerType((currentValue) => {
      if (currentValue) {
        newMap.removeLayer(rasterLayer);
        newMap.removeLayer(imageLayer);
        newMap.addLayer(imageLayer);
      } else {
        newMap.removeLayer(rasterLayer);
        newMap.removeLayer(imageLayer);
        newMap.addLayer(rasterLayer);
      }
      return currentValue;
    });

    setMap(newMap);

    return () => {
      newMap.setTarget(null);
    };
  }, [baseLayerType]);

  function changeBaseLayer() {
    setBaseLayerType(!baseLayerType);
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    try {
      const response = await fetch("http://localhost:5000/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "johndoe@example.com",
        }),
      });

      const result = await response.json();
      console.log(result); // Логируем результат ответа сервера
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function loadPolygonFromServer() {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => addPolygonFromArray(data.points))
      .catch((error) => console.log("error: " + error));
  }

  function addPolygonFromArray(polygonArray) {
    polygonsSourceRef.current.clear();
    polygonsSourceRef.current = new VectorSource();

    const polygonStyle = new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.1)",
      }),
    });

    polygonArray.map((pointsPolygon) => {
      const polygon = new Polygon([pointsPolygon]);
      const feature = new Feature({
        geometry: polygon,
      });
      polygonsSourceRef.current.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: polygonsSourceRef.current,
      style: polygonStyle,
    });
    map.addLayer(vectorLayer);
  }

  function removePolygons() {
    //пример, как взять координаты всех полигонов
    polygonsSourceRef.current.getFeatures().forEach((e, i) => {
      console.log(e.getGeometry().getCoordinates());
    });

    polygonsSourceRef.current.clear();
  }

  const [loading, setLoading] = useState(false);
  //функция для загрузки полигона с сервера
  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/data/shapefile");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={startDrawingPolygon}>Начать рисовать</button>
      <button onClick={stopDrawingPolygon}>Прекратить рисовать</button>
      <button onClick={clearPolygons}>Очистить полигон</button>
      <button onClick={loadRastrImg}>Добавить растр</button>
      <button onClick={clearRastrImg}>Очистить растры</button>
      <button onClick={loadPolygonFromServer}>Выделить дома</button>
      <button onClick={handleSubmit}>to server</button>
      <button onClick={removePolygons}>Удалить выделение</button>
      <button onClick={handleDownload} disabled={loading}>
        Download Shapefile
      </button>
      <button onClick={changeBaseLayer}>изменить подложку</button>
      <div ref={mapRef} className="mapObject"></div>
    </>
  );
};

export default MapComponent;
