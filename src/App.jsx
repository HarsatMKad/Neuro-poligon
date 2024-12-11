import { BrowserRouter, Routes, Route } from "react-router-dom";
import GeneratePolygonPage from "./pages/GeneratePolygonPage";
import OrtoneyroplanPage from "./pages/OrtoneyroplanPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrtoneyroplanPage />} />
        <Route path="/second" element={<GeneratePolygonPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
