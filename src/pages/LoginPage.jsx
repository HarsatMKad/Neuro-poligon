import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/tokenStorageController";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [successMessage, setSuccessMessage] = useState();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      saveToken(response.data.token);

      setSuccessMessage("Регистрация прошла успешно!");
      setError("");
      setEmail("");
      setPassword("");

      navigate("/profile")
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при регистрации.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="login_page">
      <form className="column_box" onSubmit={handleSubmit}>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          id="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={{ color: "red" }}>{error}</div>}
        {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}

        <button type="submit">Войти</button>
      </form>
      <div className="account_recovery_button">Забыли пароль ?</div>
      <div className="account_recovery_button">
        Нет аккаунта ?
        <Link to={"/register"}>
          <span> Создать</span>
        </Link>
      </div>
    </div>
  );
}
