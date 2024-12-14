import { BrowserRouter, Routes, Route } from "react-router-dom";
import GeneratePolygonPage from "./pages/GeneratePolygonPage";
import OrtoneyroplanPage from "./pages/OrtoneyroplanPage";
import UserProfile from "./userProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrtoneyroplanPage />} />
        <Route path="/second" element={<GeneratePolygonPage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
