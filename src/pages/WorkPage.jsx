import Header from "../components/Header";
import MapComponent from "../components/MapComponent";
import FileUpload from "../components/TifUpload";
import { useState } from "react";

export default function WorkPage() {
  const [geotiffFile, setGeotiffFile] = useState(null);

  const handleFileLoad = (file) => {
    setGeotiffFile(file);
  };
  return (
    <div>
      <Header />
      <FileUpload onFileLoad={handleFileLoad} />
      <MapComponent geotiffFile={geotiffFile} />
    </div>
  );
}
