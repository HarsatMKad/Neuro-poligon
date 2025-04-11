import { Link } from "react-router-dom";

export default function ProfileLoginSection() {
  return (
    <div className="profile_section">
      <Link to="/login">
        <button>Войти</button>
      </Link>
      <Link to="/register">
        <button>Регистрация</button>
      </Link>
    </div>
  );
}
