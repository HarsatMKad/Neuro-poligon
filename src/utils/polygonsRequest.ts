import axios from "axios";
import { getToken } from "./tokenStorageController";
import downloadFromBlob from "./downloadFromBlob";

export async function polygonsRequest(polygon) {
  const token = getToken();

  const result = await axios.post("http://localhost:3000/api/calculate", { polygon }, {
    headers: {
      Authorization: token,
    },
  });

  return result.data.points;
}

export async function polygonsDownload(polygon) {
  try {
    const token = getToken();

    const response = await axios.post(
      "http://localhost:3000/api/calculate/download", { polygon },
      {
        responseType: "blob",
        headers: {
          Authorization: token,
        },
      }
    );

    const blob = await response.data;
    downloadFromBlob(blob, "data.zip")
  } catch (error) {
    console.error(error);
    alert("При загрузке файлов произошла ошибка");
  }
}
