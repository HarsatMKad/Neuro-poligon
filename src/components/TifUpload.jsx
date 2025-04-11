import React, { useState } from 'react';

function FileUpload({ onFileLoad }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileLoad(selectedFile);
    } else {
      alert('Пожалуйста, выберите файл.');
    }
  };

  return (
    <div>
      <input type="file" accept=".tif,.tiff" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload GeoTIFF</button>
    </div>
  );
}

export default FileUpload;