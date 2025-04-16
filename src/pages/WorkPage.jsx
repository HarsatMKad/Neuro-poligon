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
  const [fatalError, setFatalError] = useState();
  const [errorResponse, setErrorResponse] = useState();
  const [messageResponse, setMessageResponse] = useState();

  const handleFileLoad = (file) => {
    setGeotiffFile(file);
    substratesInputRef.current.value = "";
    setObtainingFileMethod("download");
  };

  function getSubstrates() {
    axios
      .get("http://localhost:3000/api/substrates", {
        headers: {
          Authorization: token,
        },
      })
      .then(function (response) {
        setSubstrates(response.data);
      })
      .catch((error) => {
        console.log(error);
        setFatalError(error.response.data.message);
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
          setMessageResponse();
          setErrorResponse(error.response.data.message)
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

  async function deleteSubstrate() {
    const selectedId = substratesInputRef.current.value;

    if (substratesInputRef.current.value == "") {
      return;
    }

    try {
      await axios
        .delete(`http://localhost:3000/api/substrates/${selectedId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
        .then((response) => {
          setMessageResponse(response.data.message)
          setErrorResponse()
          setGeotiffFile(null);
          getSubstrates();
          substratesInputRef.current.value = "";
        })
        .catch((error) => {
          setErrorResponse(error.response.data.message)
          setMessageResponse()
        });
    } catch (error) {
      console.error("Ошибка при загрузке GeoTIFF:", error);
    }
  }

  return (
    <div>
      <Header token={token} />
      {errorResponse && <div style={{ color: "red" }}>{errorResponse}</div>}
      {messageResponse && <div style={{ color: "green" }}>{messageResponse}</div>}
      {fatalError && <div style={{ color: "red" }}>{fatalError}</div>}
      <div style={fatalError ? { display: "none" } : {}}>
        <FileUpload
          token={token}
          downloadKey={obtainingFileMethod == "download" ? true : false}
          onFileLoad={handleFileLoad}
          onFileSave={getSubstrates}
          errorHandler={setErrorResponse}
          messageHandler={setMessageResponse}
        />
        <select ref={substratesInputRef} onChange={changeSubstrates}>
          <option value="">Сохраненные файлы</option>
          {substrates.map((key) => (
            <option key={key.image} value={key._id}>
              {key.original_name}
            </option>
          ))}
        </select>
        <button
          style={
            substratesInputRef.current && substratesInputRef.current.value != ""
              ? {}
              : { display: "none" }
          }
          onClick={deleteSubstrate}
        >
          Удалить файл
        </button>
        <MapComponent geotiffFile={geotiffFile} />
      </div>
    </div>
  );
}
