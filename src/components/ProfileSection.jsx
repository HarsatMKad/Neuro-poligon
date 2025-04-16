import { delToken } from "../utils/tokenStorageController";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProfileSection({ token }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/api/users/info", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
        .then(function (response) {
          setUsername(response.data.username);
        })
        .catch(function (error) {
          if (error.response.status == 400) {
            console.log(error.response)
            handleLogout();
          }
        });
    }
  }, [token]);

  function handleLogout() {
    delToken();
    navigate("/login");
  }

  return (
    <div className="profile_section">
      <Link to="/profile">
        <button className="user_profile">{username}</button>
      </Link>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
}
