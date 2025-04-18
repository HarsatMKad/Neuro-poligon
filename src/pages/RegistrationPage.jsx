import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/tokenStorageController";
import { Link, useNavigate } from "react-router-dom";

export default function RegistrationPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState({message: "", color: "green"})

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setResponseMessage({message: "Пожалуйста, заполните все поля.", color: "red"})
      return;
    }

    if (confirmPassword != password) {
      setResponseMessage({message: "Пароли не совпадают.", color: "red"})
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/register",
        {
          username,
          email,
          password,
        }
      );

      saveToken(response.data.token);

      setResponseMessage({message: "Регистрация прошла успешно!", color: "greed"})
      setUsername("");
      setEmail("");
      setPassword("");

      navigate("/profile");
    } catch (err) {
      setResponseMessage({message: err.response?.data?.message || "Ошибка при регистрации.", color: "red"})
    }
  };

  return (
    <div className="login_page">
      <form className="column_box" onSubmit={handleSubmit}>
        <input
          type="username"
          id="username"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <input
          type="password"
          id="confirmPassword"
          placeholder="Подтвердить пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {responseMessage && <div style={{ color: responseMessage.color }}>{responseMessage.message}</div>}

        <button type="submit">Зарегистрироваться</button>
      </form>
      <div className="account_recovery_button">
        Уже есть аккаунт?
        <Link to={"/login"}>
          <span> Войти</span>
        </Link>
      </div>
    </div>
  );
}
