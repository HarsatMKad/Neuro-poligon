import { useEffect, useState } from "react";
import { delToken } from "../utils/tokenStorageController";
import SubscriptionCard from "./SubscriptionCard";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ProfileInfo({ token, responseMessageHandler }) {
  const [user, setUser] = useState({});
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subscription, setSubscription] = useState({});
  const navigate = useNavigate();

  function setUserDate(){
    if (token) {
      axios
        .get("http://localhost:3000/api/users/info", {
          headers: {
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
  }

  useEffect(() => {
    setUserDate()
  }, [token]);

  function saveEdituser() {
    const updateFields = {};

    if (newUsername != user.username) {
      if (newUsername.length > 3) {
        updateFields.username = newUsername;
      } else {
        if(responseMessageHandler){
          responseMessageHandler({message: "Имя должно иметь длину больше 3 символов", color: "red"})
        }
        return;
      }
    }

    if (newEmail != user.email) {
      if (newEmail.length > 3) {
        updateFields.email = newEmail;
      } else {
        if(responseMessageHandler){
          responseMessageHandler({message: "Почта должна иметь длину больше 3 символов", color: "red"})
        }
        return;
      }
    }

    if (newPassword.length > 0 || confirmPassword.length > 0) {
      if (newPassword === confirmPassword && newPassword.length > 5) {
        updateFields.password = newPassword;
      } else {
        if(responseMessageHandler){
          responseMessageHandler({message: "Пароли должны совпадать и иметь длину 6 и больше символов.", color: "red"})
        }
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
          if(responseMessageHandler){
            responseMessageHandler({message: response.data.message, color: "green"})
          }
          setUserDate()
        })
        .catch(function (error) {
          if(responseMessageHandler){
            responseMessageHandler({message: error.response.data.message, color: "red"})
          }
        });
    }
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
          <SubscriptionCard
            name={subscription ? subscription.name : "Отсутствует"}
            description={subscription && subscription.description}
            lvl={subscription && subscription.lvl}
            expiration_sup_date={subscription && user.expiration_sup_date}
            substrates_max={subscription && subscription.substrates_max}
          />
          <Link to="/subscriptions">
            <button>Изменить</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
