import Header from "../components/Header";
import MapComponent from "../components/MapComponent";
import FileUpload from "../components/TifUpload";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/tokenStorageController";

export default function WorkPage() {
  const [geotiffFile, setGeotiffFile] = useState(null);
  const [substrates, setSubstrates] = useState([]);
  const [obtainingFileMethod, setObtainingFileMethod] = useState();
  const token = getToken();
  const substratesInputRef = useRef();

  const handleFileLoad = (file) => {
    setGeotiffFile(file);
    setObtainingFileMethod("download");
  };

  function getSubstrates() {
    axios
      .get("http://localhost:3000/api/substrates", {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      })
      .then(function (response) {
        setSubstrates(response.data);
      });
  }

  useEffect(() => {
    getSubstrates(token);
  }, [token]);

  async function changeSubstrates() {
    setObtainingFileMethod("selected");

    if (substratesInputRef.current.value == "") {
      setGeotiffFile(null);
      return;
    }

    const selectedId = substratesInputRef.current.value;

    try {
      const response = await axios
        .get(`http://localhost:3000/api/substrates/${selectedId}`, {
          responseType: "blob",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        })
        .catch((error) => {
          throw new Error(`Ошибка при получении файла: ${error}`);
        });

      const blob = response.data;
      const substratesFile = new File([blob], "tifFileName", {
        type: "image/tiff",
      });
      setGeotiffFile(substratesFile);
    } catch (error) {
      console.error("Ошибка при загрузке GeoTIFF:", error);
    }
  }

  return (
    <div>
      <Header token={token}/>
      <FileUpload
        token={token}
        downloadKey={obtainingFileMethod == "download" ? true : false}
        onFileLoad={handleFileLoad}
        onFileSave={getSubstrates}
      />
      <select ref={substratesInputRef} onChange={changeSubstrates}>
        <option value="">Выберите файл</option>
        {substrates.map((key) => (
          <option key={key.image} value={key._id}>
            {key.original_name}
          </option>
        ))}
      </select>
      <MapComponent token={token} geotiffFile={geotiffFile} />
    </div>
  );
}
