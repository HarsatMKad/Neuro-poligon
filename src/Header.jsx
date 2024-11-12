import logo from "./assets/logo.svg"

export default function HeaderMain(){
    return(
        <header>
            <img src={logo} alt=""/>
            <div className="navigation_buttons">
                <button>Создание ортонейроплана</button>
                <button className="current_page_button">Генерация полигонов</button>
                <button>Стоимость</button>
                <button>Контакты</button>
            </div>

            <div>
                <button className="login_button">Войти</button>
                <button className="regustration_button">Регистрация</button>
            </div>
        </header>
    )
}