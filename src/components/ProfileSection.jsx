import { delToken } from "../utils/tokenStorageController";
import { Link, useNavigate } from "react-router-dom";

export default function ProfileSection() {
  const username = "user"

  const navigate = useNavigate();

  function handleLogout() {
    delToken();
    navigate("/")
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
