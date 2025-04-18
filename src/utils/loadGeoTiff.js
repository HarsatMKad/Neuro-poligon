import * as geotiff from "geotiff";

export default async function loadGeoTiff(
  file,
  setUrl,
  setBounds,
  setLoading,
  map
) {
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
    map.setView([lat, lng]);

    const data = await image.readRasters();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.getImageData(0, 0, width, height);

    function setTransparentPixel(imageData, index) {
      imageData.data[index] = 0;
      imageData.data[index + 1] = 0;
      imageData.data[index + 2] = 0;
      imageData.data[index + 3] = 0;
    }

    if (samplesPerPixel === 1) {
      for (let i = 0; i < data[0].length; i++) {
        const value = data[0][i];
        const index = i * 4;
        if (value === 0) {
          setTransparentPixel(imageData, index);
        } else {
          imageData.data[index] = value;
          imageData.data[index + 1] = value;
          imageData.data[index + 2] = value;
          imageData.data[index + 3] = 255;
        }
      }
    } else if (samplesPerPixel === 3 || samplesPerPixel === 4) {
      for (let i = 0; i < width * height; i++) {
        const index = i * 4;
        if (
          data[0][i] === 0 &&
          data[1][i] === 0 &&
          data[2][i] === 0 &&
          (samplesPerPixel === 3 || data[3][i] === 0)
        ) {
          setTransparentPixel(imageData, index);
        } else {
          imageData.data[index] = data[0][i];
          imageData.data[index + 1] = data[1][i];
          imageData.data[index + 2] = data[2][i];
          imageData.data[index + 3] = samplesPerPixel === 4 ? data[3][i] : 255;
        }
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

    setUrl(imageUrl);
    setBounds(bounds);
    setLoading(false);
  } catch (error) {
    console.error("Error loading GeoTIFF:", error);
    alert("Ошибка при загрузке GeoTIFF: " + error);
    setLoading(false);
  }
}
