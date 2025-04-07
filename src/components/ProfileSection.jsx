import { useState } from "react";
import { Link } from "react-router-dom";
import { delToken } from "../utils/tokenStorageController";

export default function ProfileSection() {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem('authToken')));

  const handleLogout = () => {
    delToken
    setToken(null);
  };

  if (!token) {
    return (
      <div>
        <button className="login_button">
          <Link to="/login">Войти</Link>
        </button>
        <button className="regustration_button">
          <Link to="/registr">Регистрация</Link>
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <Link to="/profile">Профиль</Link>
        <button className="regustration_button" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    );
  }
}
