import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/tokenStorageController";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        password, 
      });

      console.log("Успешная регистрация:", response.data);
      console.log("токен = ", response.data.token)
      saveToken(response.data.token)

      setSuccessMessage("Регистрация прошла успешно!");
      setError("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка при регистрации."); 
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Почта:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};
