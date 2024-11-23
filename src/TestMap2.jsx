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

const MapComponent = () => {
  const mapRef = useRef();
  const [polygonPoints, setPolygonPoints] = useState();
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
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

      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
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

  function stopDrawingAndClearPolygon() {
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
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

  return (
    <>
      <button onClick={startDrawingPolygon}>Начать рисование</button>
      <button onClick={stopDrawingAndClearPolygon}>Очистить полигон</button>
      <button onClick={loadRastrImg}>Добавить растр</button>
      <button onClick={clearRastrImg}>Очистить растры</button>
      <div ref={mapRef} className="mapObject"></div>
    </>
  );
};

export default MapComponent;
