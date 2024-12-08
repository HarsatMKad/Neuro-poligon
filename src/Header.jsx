import logo from "./assets/logo.svg";
import { Link } from "react-router-dom";

export default function HeaderMain() {
  return (
    <header>
      <img src={logo} alt="" />
      <div className="navigation_buttons">
        <button>
          <Link to="/">Создание ортонейроплана</Link>
        </button>
        <button className="current_page_button">Генерация полигонов</button>
        <button>Стоимость</button>
        <button>
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
