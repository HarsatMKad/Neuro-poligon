import axios from "axios";
import { getToken } from "./tokenStorageController";

export async function polygonsRequest() {
  const token = getToken();

  const result = await axios.get("http://localhost:3000/api/calculate", {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token,
    },
  });

  return result.data.points;
}

export async function polygonsDownload() {
  try {
    const token = getToken();

    const response = await axios.get(
      "http://localhost:3000/api/calculate/download",
      {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      }
    );

    const blob = await response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.zip");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("При загрузке файлов произошла ошибка");
  }
}
