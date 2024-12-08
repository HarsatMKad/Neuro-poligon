import HeaderMain from "./Header";
import CardInfo from "./CardInfo";
import AttractiveButtons from "./AttractiveButtons";
import cardimg1 from "../public/poligon_show_img1.jpg";
import cardimg2 from "../public/poligon_show_img2.jpg";
import MapComponent2 from "./TestMap2";

export default function SecondPage(){
    const card1Title = "glwkjrngiuqwpgwq";
    const c1t1 =
      "Подгрузив вашу подложку (ортофотоплан, спутниковые снимки)  Вы можете выделить нужную вам территорию для обработки";
    const c1t2 =
      "При необходимости более точного анализа (или ускорения работы нейросети) существует возможность добавления векторного слоя (с предварительно проанализированной карты высот)";
    const c1t3 = "Ваши исходные данные будут обработаны нашей нейросетью.";
    const card1MainText = [c1t1, c1t2, c1t3];
  
    const card2Title = "geqorgopergjq";
    const c2t1 =
      "В последствии вы получите контур строений по их крышам, согласно заданным критериям обнаружения. и исходным материалам";
    const c2t2 = "Ваши исходные данные будут обработаны нашими алгоритмами.";
    const card2MainText = [c2t1, c2t2];

    return(
    <div>
      <HeaderMain />
      <div className="context_title">Как это работает ?</div>
      <CardInfo
        img={cardimg1}
        titleText={card1Title}
        mainText={card1MainText}
        direction={true}
      />
      <CardInfo
        img={cardimg2}
        titleText={card2Title}
        mainText={card2MainText}
        direction={false}
      />
      <AttractiveButtons />
      <MapComponent2 />
    </div>
    )
}