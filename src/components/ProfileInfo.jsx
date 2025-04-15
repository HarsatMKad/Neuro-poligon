import { useEffect, useState } from "react";
import { delToken } from "../utils/tokenStorageController";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfileInfo({ token }) {
  const [user, setUser] = useState({});
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subscription, setSubscription] = useState({ });
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/api/users/info", {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        })
        .then(function (response) {
          setUser(response.data);
          setNewUsername(response.data.username);
          setNewEmail(response.data.email);
          setSubscription(response.data.subscription);
        })
        .catch(function (error) {
          if (error.response.status == 400) {
            delToken();
            navigate("/login");
          }
        });
    }
  }, [token]);

  function saveEdituser() {
    const updateFields = {};

    if (newUsername != user.username) {
      if (newUsername.length > 3) {
        updateFields.username = newUsername;
      } else {
        alert("Имя должно иметь длину больше 3 символов.");
      }
    }

    if (newEmail != user.email) {
      if (newEmail.length > 3) {
        updateFields.email = newEmail;
      } else {
        alert("Почта должна иметь длину больше 3 символов.");
        return;
      }
    }

    if (newPassword.length > 0 || confirmPassword.length > 0) {
      if (newPassword === confirmPassword && newPassword.length > 5) {
        updateFields.password = newPassword;
      } else {
        alert("Пароли должны совпадать и иметь длину больше 6 символов.");
        return;
      }
    }

    if (token) {
      axios
        .put("http://localhost:3000/api/users/", updateFields, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
        .then(function (response) {
          alert("Данные были успешно изменены");
          console.log(response);
        })
        .catch(function (error) {
          if (error.response.status == 400) {
            delToken();
            navigate("/login");
          }
          console.log(error);
          alert("При изменении данных произошла ошибка");
        });
    }
  }

  function convertSupDate(numberDate) {
    if (!numberDate) {
      return "";
    }
    const date = new Date(numberDate);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("ru-US", options).format(
      date
    );
    return formattedDate;
  }

  return (
    <div className="profile_info_section">
      <div className="row">
        <div className="column_info">
          <p>ПРОФИЛЬ</p>
          <input
            type="username"
            id="username"
            placeholder="Имя пользователя"
            onChange={(e) => {
              setNewUsername(e.target.value);
            }}
            defaultValue={user.username}
          />
          <input
            type="email"
            id="email"
            placeholder="Email"
            onChange={(e) => {
              setNewEmail(e.target.value);
            }}
            defaultValue={user.email}
          />
          <input
            type="password"
            id="password"
            placeholder="Пароль"
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Подтвердить пароль"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          <button onClick={saveEdituser}>Сохранить изменения</button>
        </div>

        <div className="column_info">
          <p>Подписка</p>
          <div className="subscription_box">
            <span>{subscription.name}</span>
            <hr />
            <span>{subscription.description}</span>
            <span>{"Уровень: " + subscription.lvl}</span>
            <span>
              {"Действует до: " + convertSupDate(user.expiration_sup_date)}
            </span>
          </div>
          <button>Изменить</button>
        </div>
      </div>
    </div>
  );
}
