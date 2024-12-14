import React, { useState } from "react";
import VkAuth from "react-vk-auth";
import { Link } from "react-router-dom";

export default function ProfileSection() {
  const [user, setUser] = useState(null);

  const handleLogin = (response) => {
    loginUser(response.session.user.id);
  };

  const registrationUser = (response) => {
    registrUser(
      response.session.user.id,
      response.session.user.last_name,
      response.session.user.first_name
    );
  };

  function loginUser(id) {
    fetch(`http://localhost:3000/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          alert("Пользователь не существует");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data[0]);
      })
      .catch((error) => {
        console.error("Ошибка при получении пользователя:", error);
      });
  }

  function registrUser(id, last_name, first_name) {
    fetch(`http://localhost:3000/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.length == null) {
          addUser(id, last_name + " " + first_name);
        } else {
          alert("Такой пользователь уже существует");
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении пользователя:", error);
      });
  }

  function addUser(id, nickname) {
    fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        nickname: nickname,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setUser(data);
      });
  }

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div>
        <VkAuth
          apiId="52840071"
          callback={handleLogin}
          className="login_button"
        >
          Войти
        </VkAuth>
        <VkAuth
          apiId="52840071"
          callback={registrationUser}
          className="regustration_button"
        >
          Регистрация
        </VkAuth>
      </div>
    );
  } else {
    return (
      <div>
        <Link to="/profile">Профиль</Link>
        <div>{user.nickname}</div>
        <button className="regustration_button" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    );
  }
}
