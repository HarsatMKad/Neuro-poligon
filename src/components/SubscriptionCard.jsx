export default function SubscriptionCard({
  name,
  description,
  lvl,
  substrates_max,
  expiration_sup_date,
  duration,
  price,
  isBuy = false,
}) {
  function convertSupDate(numberDate) {
    if (!numberDate) {
      return "";
    }
    const date = new Date(numberDate);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("ru-US", options).format(
      date
    );
    return formattedDate;
  }

  function convertDuration(date) {
    return date / (1000 * 60 * 60 * 24);
  }

  return (
    <div className="subscription_box">
      <div className="header">
        <span>{name}</span>
        <span>{isBuy && "Преобретено"}</span>
      </div>
      <hr />
      <span>{description}</span>
      <span>{lvl && "Уровень: " + lvl}</span>
      <span>{substrates_max && "Количество подложек: " + substrates_max}</span>
      <span>
        {expiration_sup_date &&
          "Действует до: " + convertSupDate(expiration_sup_date)}
      </span>
      <span>
        {duration && "Время действия: " + convertDuration(duration) + " дней"}
      </span>
      <span>{price && "Цена: " + price + "р"}</span>
    </div>
  );
}
