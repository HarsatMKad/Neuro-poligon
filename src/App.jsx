import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import SecondPage from "./SecondPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/second" element={<SecondPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
