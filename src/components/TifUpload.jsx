import React, { useRef, useState } from "react";
import axios from "axios";

export default function FileUpload({
  token,
  downloadKey,
  onFileLoad,
  onFileSave,
  errorHandler,
  messageHandler
}) {
  const [fileKey, setFileKey] = useState(Date.now());
  const [geotiffFile, setGeotiffFile] = useState();
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onFileLoad(selectedFile);
      setGeotiffFile(selectedFile);
      setFileKey(Date.now());
    }
  };

  function saveFile() {
    const formData = new FormData();
    formData.append("image", geotiffFile);

    axios
      .post("http://localhost:3000/api/substrates", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response);
        if(messageHandler){
          messageHandler("Сохранение завершено")
        }
        if(errorHandler){
          errorHandler()
        }
        onFileSave();
      })
      .catch((error) => {
        if(errorHandler){
          if(messageHandler){
            messageHandler()
          }
          errorHandler(error.response.data.message)
        }
      });
  }

  return (
    <div>
      <input
        key={fileKey}
        type="file"
        accept=".tif,.tiff"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      <button onClick={handleButtonClick}>Загрузить Файл</button>

      <button onClick={saveFile} style={downloadKey ? {} : { display: "none" }}>
        Сохранить файл
      </button>
    </div>
  );
}
