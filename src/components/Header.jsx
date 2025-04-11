import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";
import { getToken } from "../utils/tokenStorageController";
import ProfileSection from "./ProfileSection";
import ProfileLoginSection from "./ProfileLoginSection";

export default function Header() {
  const token = getToken();

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
          <Link to="/work">
            <button>Рабочий стол</button>
          </Link>
        </nav>

        {token ? <ProfileSection /> : <ProfileLoginSection />}
      </div>
    </header>
  );
}
