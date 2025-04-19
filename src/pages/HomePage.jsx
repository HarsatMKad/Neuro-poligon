import Header from "../components/Header";
import { getToken } from "../utils/tokenStorageController";
import { Link } from "react-router-dom";
import workImage from "../assets/image.png";

export default function HomePage() {
  const token = getToken();

  return (
    <div className="page">
      <Header token={token} />
      <div className="home_page">
        <div className="home_main_container">
          <div>
            <div className="title">БЫСТРО, ТОЧНО, ДЁШЕВО</div>
            <div className="text_body">
              Мы предлагаем автоматизацию процесса создания ортоизображений,
              делая его доступным, быстрым и качественным. <br /> Представляем
              Вам «ортонейроплан» — ортоизображение с географической привязкой,
              которое сочетает в себе красоту и практическую ценность. Идеально
              подходит для геоинформационных и визуализационных задач.
            </div>
            <button className="trynow_button">
              <Link to={token? "/profile": "/register"} style={{ textDecoration: 'none', color: 'inherit' }}>Попробовать сейчас</Link>
            </button>
          </div>

          <img src={workImage} />

          <div className="full_logo_name">
            <div className="neuro">NEURO</div>
            <div className="poligon">POLIGON</div>
          </div>
        </div>
      </div>
    </div>
  );
}
