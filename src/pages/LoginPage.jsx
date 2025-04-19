import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/tokenStorageController";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState({message: "", color: "green"})

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setResponseMessage({message: "Пожалуйста, заполните все поля.", color: "red"})
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      saveToken(response.data.token);

      setResponseMessage({message: "Регистрация прошла успешно!", color: "green"})
      setEmail("");
      setPassword("");

      navigate("/profile")
    } catch (err) {
      setResponseMessage({message: err.response?.data?.message || "Ошибка при регистрации.", color: "red"})
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

        {responseMessage && <div style={{ color: responseMessage.color }}>{responseMessage.message}</div>}

        <button type="submit">Войти</button>
      </form>
      <div className="account_recovery_button">Забыли пароль ?</div>
      <div className="account_recovery_button">
        Нет аккаунта ?
        <Link to={"/register"} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span> Создать</span>
        </Link>
      </div>
    </div>
  );
}
