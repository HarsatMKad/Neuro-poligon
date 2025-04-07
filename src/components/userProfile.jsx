import HeaderMain from "./Header";
import { useState, useEffect, useRef } from "react";

export default function userProfile() {
  const userId = 282483342;

  const nicknameLableRef = useRef();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser(userId);
    nicknameLableRef.current.focus();
  }, []);

  function checkUser(id) {
    fetch(`http://localhost:3000/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          return false;
        }
        return response.json();
      })
      .then((data) => {
        setUser(data[0]);
        return true;
      })
      .catch((error) => {
        console.error("Ошибка при получении пользователя:", error);
      });
  }

  function updUser(id, newNickname, newSubLvl) {
    fetch(`http://localhost:3000/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        nickname: newNickname,
        subscription_lvl: newSubLvl,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return false;
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        return true;
      });
  }

  function saveChanges() {
    const newNickname = nicknameLableRef.current.value.trim();
    if (newNickname) {
      updUser(userId, newNickname, user.subscription_lvl);
    }
  }

  return (
    <div>
      <HeaderMain />
      <input
        ref={nicknameLableRef}
        type="text"
        placeholder="Nickname..."
        defaultValue={user ? user.nickname : ""}
      ></input>
      <button onClick={saveChanges}>Сохранить</button>
    </div>
  );
}
