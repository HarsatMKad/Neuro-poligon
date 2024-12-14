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
  const linedBacking = useRef(null);
  const linedBackingIndex = useRef(null);
  const [polygonPoints, setPolygonPoints] = useState();
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
  const polygonsSourceRef = useRef(new VectorSource());
  const [map, setMap] = useState(null);
  const [baseLayerType, setBaseLayerType] = useState("1");
  const [substrateUrl, setSubstrateUrl] = useState(null);
  const [substrateCount, setSubstrateCount] = useState(0);

  const projection = "EPSG:3857";

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
      projection: projection,
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
    linedBacking.current.focus();
    if (substrateCount > 0) {
      linedBackingIndex.current.focus();
    }

    const rasterLayer = new TileLayer({
      source: new OSM(),
    });

    const view = new View({
      center: fromLonLat([37.6173, 55.7558]), // Москва        wgs86 псевдомеркатер, для нашего региона wgs 86 45n
      zoom: 10,
    });

    const imageSource = new Static({
      url: substrateUrl, // Укажите путь к вашему изображению
      projection: projection,
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
      switch (currentValue) {
        case "1":
          newMap.removeLayer(rasterLayer);
          newMap.removeLayer(imageLayer);
          newMap.addLayer(rasterLayer);
          break;
        case "2":
          if (substrateCount > 0) {
            newMap.removeLayer(rasterLayer);
            newMap.removeLayer(imageLayer);
            newMap.addLayer(imageLayer);
          }
          break;
      }
      return currentValue;
    });

    setMap(newMap);

    return () => {
      newMap.setTarget(null);
    };
  }, [baseLayerType, substrateUrl]);

  function loadPolygonFromServer() {
    fetch("http://localhost:3000/api/data")
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
    polygonsSourceRef.current.getFeatures().forEach((e, i) => {
      console.log(e.getGeometry().getCoordinates());
    });

    polygonsSourceRef.current.clear();
  }

  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/data/shapefile");
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

  function setnewImg(index) {
    if (!index) return;
    fetch("http://localhost:3000/substrates/282483342?index=" + index)
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => setSubstrateUrl(url))
      .catch((error) => console.error("Error fetching image:", error));
  }

  function getImgTest() {
    setnewImg();
    setBaseLayerType(linedBacking.current.value);
    if (linedBacking.current.value == "2") {
      getCount();
    } else {
      setSubstrateCount(0);
    }
  }

  function getCount() {
    fetch(`http://localhost:3000/api/image-ids/282483342`)
      .then((response) => response.json())
      .then((data) => {
        setSubstrateCount(data.length);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function showBackingImage() {
    if (linedBackingIndex.current.value) {
      setnewImg(linedBackingIndex.current.value);
    }
  }

  return (
    <>
      <button onClick={startDrawingPolygon}>Начать рисовать</button>
      <button onClick={stopDrawingPolygon}>Прекратить рисовать</button>
      <button onClick={clearPolygons}>Очистить полигон</button>
      <button onClick={loadRastrImg}>Добавить растр</button>
      <button onClick={clearRastrImg}>Очистить растры</button>
      <button onClick={loadPolygonFromServer}>Выделить дома</button>
      <button onClick={removePolygons}>Удалить выделение</button>
      <button onClick={handleDownload} disabled={loading}>
        Download Shapefile
      </button>

      <select ref={linedBacking}>
        <option value={1}>OSM</option>
        <option value={2}>Пользовательская подложка</option>
      </select>

      <button onClick={getCount}> count </button>

      <button onClick={getImgTest}>Выбрать подложку</button>

      {substrateCount > 0 && (
        <div>
          <select ref={linedBackingIndex}>
            {[...Array(substrateCount).keys()].map((index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </select>
          <button onClick={showBackingImage}>подтвердить</button>
        </div>
      )}

      <div ref={mapRef} className="mapObject"></div>
    </>
  );
};

export default MapComponent;
