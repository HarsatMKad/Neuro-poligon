import logo from "./assets/logo.svg";
import { Link } from "react-router-dom";

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
          <Link to="/">Создание ортонейроплана</Link>
        </button>
        <button className={getButtonStyle(2)}>
          <Link to="/second">Генерация полигонов</Link>
        </button>
        <button className={getButtonStyle(3)}>Стоимость</button>
        <button className={getButtonStyle(4)}>
          {" "}
          <Link to="/second">Контакты</Link>{" "}
        </button>
      </div>

      <div>
        <button className="login_button">Войти</button>
        <button className="regustration_button">Регистрация</button>
      </div>
    </header>
  );
}
