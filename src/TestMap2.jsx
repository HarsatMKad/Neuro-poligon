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
      return;
    }

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

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: polygonStyle,
    });

    const view = new View({
      center: fromLonLat([37.6173, 55.7558]), // Москва        wgs86 псевдомеркатер, для нашего региона wgs 86 45n
      zoom: 10,
    });

    const newMap = new Map({
      layers: [rasterLayer, vectorLayer],
      target: mapRef.current,
      view: view,
    });
    setMap(newMap);

    return () => {
      newMap.setTarget(null);
    };
  }, []);

  function gfromS() {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.log("error: " + error));
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

  function addPolygonFromPoints() {
    polygonsSourceRef.current.clear();

    const points = [
      [4164072.513334261, 7500324.076774161],
      [4177219.682199311, 7519891.956015167],
      [4210851.974644789, 7503840.180075279],
      [4173244.9567284817, 7486718.2857394],
      [4164072.513334261, 7500324.076774161],
    ];

    const points2 = [
      [4118974.6666460065, 7501088.447057013],
      [4120350.53315514, 7509955.142338094],
      [4132733.3317373386, 7507356.283376398],
      [4118974.6666460065, 7501088.447057013],
    ];

    const points3 = [
      [4231948.594451497, 7517751.719223182],
      [4254115.332654199, 7525701.17016484],
      [4270167.108594085, 7516528.726770619],
      [4262676.279822138, 7502311.439509576],
      [4247236.000108533, 7505674.668754124],
      [4230114.105772653, 7508579.27582896],
      [4231948.594451497, 7517751.719223182],
    ];
    // Преобразуем координаты в объект Geometry
    const polygon = new Polygon([points]);
    const polygon2 = new Polygon([points2]);
    const polygon3 = new Polygon([points3]);

    // Создаем Feature с геометрией полигона
    const feature = new Feature({
      geometry: polygon,
    });

    const feature2 = new Feature({
      geometry: polygon2,
    });

    const feature3 = new Feature({
      geometry: polygon3,
    });

    // Определяем стиль для полигона
    const polygonStyle = new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.1)",
      }),
    });

    polygonsSourceRef.current = new VectorSource();

    polygonsSourceRef.current.addFeature(feature);
    polygonsSourceRef.current.addFeature(feature2);
    polygonsSourceRef.current.addFeature(feature3);

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
      const response = await fetch('http://localhost:5000/shapefile');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'geojson.zip';
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
      <button onClick={gfromS}>test button</button>
      <button onClick={handleSubmit}>to server</button>
      <button onClick={addPolygonFromPoints}>Выделить дома</button>
      <button onClick={removePolygons}>Удалить выделение</button>

      <button onClick={handleDownload} disabled={loading}>
        Download Shapefile
      </button>
      <div ref={mapRef} className="mapObject"></div>
    </>
  );
};

export default MapComponent;
