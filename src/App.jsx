import { BrowserRouter, Routes, Route } from "react-router-dom";
import GeneratePolygonPage from "./pages/GeneratePolygonPage";
import OrtoneyroplanPage from "./pages/OrtoneyroplanPage";
import UserProfile from "./components/userProfile";
import WorkplaceMap from "./pages/WorkplaceMap";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegistrPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ortoplane" element={<OrtoneyroplanPage />} />
        <Route path="/second" element={<GeneratePolygonPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<WorkplaceMap />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registr" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
