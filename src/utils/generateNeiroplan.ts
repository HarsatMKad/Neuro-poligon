import axios from "axios";
import { getToken } from "./tokenStorageController";
import downloadFromBlob from "./downloadFromBlob";

export async function generateOrtoneiroplan(polygon) {
  if (polygon.length < 0) {
    return;
  }

  try {
    const token = getToken();
    const response = await axios
      .post(
        `http://localhost:3000/api/calculate/ortoneiroplan`,
        { polygon },
        {
          responseType: "blob",
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        if(error.status == 500){
          alert("Ошибка. Некорректный полигон")
        }
        throw new Error(error);
      });

    const blob = response.data;
    const neiroplanFile = new File([blob], "tifFileName", {
      type: "image/tiff",
    });

    return neiroplanFile;
  } catch (error) {
    console.error("Ошибка при загрузке GeoTIFF:", error);
  }
}


export async function downloadOrtoneiroplan(polygon) {
  if (polygon.length < 0) {
    return;
  }

  try {
    const token = getToken();
    const response = await axios
      .post(
        `http://localhost:3000/api/calculate/ortoneiroplan`,
        { polygon },
        {
          responseType: "blob",
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        throw new Error(error);
      });

    console.log(response);

    const blob = response.data;
    downloadFromBlob(blob, "Ortoneiroplan.tif");
  } catch (error) {
    console.error("Ошибка при загрузке GeoTIFF:", error);
  }
}
