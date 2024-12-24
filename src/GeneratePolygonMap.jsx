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
import axios from "axios";

const GeneratePolygonMap = () => {
  const mapRef = useRef();
  const linedBacking = useRef(null);
  const linedBackingIndex = useRef(null);
  const [polygonPoints, setPolygonPoints] = useState();
  const vectorSourceRef = useRef(new VectorSource());
  const drawInteractionRef = useRef(null);
  const [map, setMap] = useState(null);
  const [baseLayerType, setBaseLayerType] = useState("1");
  const [substrateUrl, setSubstrateUrl] = useState(null);
  const [substrateArray, setSubstrateArray] = useState([]);
  const substrateMaxCount = 5;
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
      console.log(event.feature.getGeometry().getCoordinates());

      setPolygonPoints(event.feature.getGeometry().getCoordinates());
      stopDrawingPolygon(); //функция для прекращения рисования после завершения одного полигона
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
    setPolygonPoints();
  }

  useEffect(() => {
    linedBacking.current.focus();
    if (substrateArray.length > 0) {
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
          if (substrateArray.length > 0) {
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

  function setnewImg(index) {
    if (!index) return;
    fetch("http://localhost:3000/substrates/" + index)
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => setSubstrateUrl(url))
      .catch((error) => console.error("Error fetching image:", error));
  }

  function changeBackground() {
    setBaseLayerType(linedBacking.current.value);
    if (linedBacking.current.value == "2") {
      setUserSubstrateArray();
    } else {
      setSubstrateArray([]);
    }
    clearPolygons();
  }

  function setUserSubstrateArray() {
    fetch(`http://localhost:3000/api/image-ids/282483342`)
      .then((response) => response.json())
      .then((data) => {
        setSubstrateArray(data);
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

  function uploadUserImage(img) {
    const formData = new FormData();
    formData.append("image", img);

    try {
      const response = axios.post(
        `http://localhost:3000/api/upload-image/282483342`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`Файл успешно загружен!`);
      setUserSubstrateArray();
    } catch (error) {
      alert("Произошла ошибка при загрузке файла.");
      console.log("ошибка при загрузке файла.", error);
    }
  }

  function initUploadImg() {
    setUserSubstrateArray();
    if (substrateArray.length < substrateMaxCount) {
      document.getElementById("fileInput").click();
    } else {
      alert("Достигнут максимум подложек");
    }
  }

  async function deleteUserImage() {
    try {
      const index = linedBackingIndex.current.value;
      const response = await axios.delete(
        `http://localhost:3000/api/images/${index}`
      );

      if (response.status === 200) {
        alert("Изображение удалено.");
        setUserSubstrateArray();
      } else {
        alert("При удалении изображения что-то пошло не так.");
      }
    } catch (error) {
      console.log("Ошибка при удалении изображения:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleRightClick = (event) => {
    event.preventDefault();
    stopDrawingPolygon();
  };

  return (
    <>
      <div className="mapControlButtonSection">
        <div>
          <button onClick={startDrawingPolygon}>Выделить область</button>
          <button onClick={clearPolygons}>Очистить</button>

          <div style={polygonPoints ? {} : { display: "none" }}>
            <button onClick={loadRastrImg}>Добавить растр</button>
            <button onClick={clearRastrImg}>Очистить растры</button>
            <button>Скачаить</button>
          </div>
        </div>

        <div>
          <label for={linedBacking}>Подложка:</label>
          <select onChange={changeBackground} ref={linedBacking}>
            <option value={1}>OSM</option>
            <option value={2}>Пользовательская подложка</option>
          </select>

          {linedBacking.current && linedBacking.current.value == "2" && (
            <div>
              <select ref={linedBackingIndex}>
                {substrateArray.map((key, index) => (
                  <option key={index} value={key}>
                    {index + 1}
                  </option>
                ))}
              </select>

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => uploadUserImage(e.target.files[0])}
              ></input>

              <button
                disabled={substrateArray.length == 0}
                onClick={showBackingImage}
              >
                Подтвердить
              </button>
              <button onClick={initUploadImg}>Добавить подложку</button>
              <button style={{ color: "red" }} onClick={deleteUserImage}>
                Удалить подложку
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={mapRef}
        className="mapObject"
        onContextMenu={handleRightClick}
      ></div>
    </>
  );
};

export default GeneratePolygonMap;
