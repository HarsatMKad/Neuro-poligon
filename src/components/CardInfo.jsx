export default function CardInfo({img, titleText, mainText, direction}){

    var contText = mainText.map((text, index)=>
        <div key={index}>
            <br/> 
            {text} 
            <br/> 
        </div>
    )

    if(direction){
        return(
            <div className="card_container">
                <img src={img} alt="" />
                <div className="card_text">
                    <div className="card_title">{titleText}</div>

                    {contText}
                </div>
            </div>
        )
    } else {
        return(
            <div className="card_container">
                <div className="card_text">
                    <div className="card_title">{titleText}</div>
                    {contText}
                    </div>
                <img src={img} alt="" />
            </div>
        )
    }
}