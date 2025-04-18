import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";
import ProfileSection from "./ProfileSection";
import ProfileLoginSection from "./ProfileLoginSection";

export default function Header({ token }) {
  return (
    <header>
      <div className="row_box">
        <div className="logo_background">
          <Link to="/">
            <img src={logo} alt="" />
          </Link>
        </div>

        <nav className="navigation_buttons">
          <Link to="/">
            <button>Главная</button>
          </Link>
          <Link to="/polygonsGenerator">
            <button>Генерация полигонов</button>
          </Link>
          <Link to="/ortoneiroplan">
            <button>Создание ортонейроплана</button>
          </Link>
        </nav>

        {token ? <ProfileSection token={token} /> : <ProfileLoginSection />}
      </div>
    </header>
  );
}
