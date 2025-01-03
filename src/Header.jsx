import logo from "./assets/logo.svg";
import { Link } from "react-router-dom";
import ProfileSection from "./ProfileSection";

export default function HeaderMain({ currentSection }) {
  const getButtonStyle = (index) => {
    if (currentSection === index) {
      return "current_page_button";
    }
    return "";
  };

  return (
    <header>
      <img src={logo} alt="" />
      <div className="navigation_buttons">
        <button className={getButtonStyle(1)}>
          <Link to="/ortoplane">Создание ортонейроплана</Link>
        </button>
        <button className={getButtonStyle(2)}>
          <Link to="/second">Генерация полигонов</Link>
        </button>
        <button className={getButtonStyle(3)}>
          <Link to="/">Стоимость</Link>
        </button>
        <button className={getButtonStyle(4)}>
          <Link to="/second">Контакты</Link>
        </button>
      </div>

      <ProfileSection />
    </header>
  );
}
