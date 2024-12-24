import { BrowserRouter, Routes, Route } from "react-router-dom";
import GeneratePolygonPage from "./pages/GeneratePolygonPage";
import OrtoneyroplanPage from "./pages/OrtoneyroplanPage";
import UserProfile from "./userProfile";
import WorkplaceMap from "./pages/WorkplaceMap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ortoplane" element={<OrtoneyroplanPage />} />
        <Route path="/second" element={<GeneratePolygonPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<WorkplaceMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
