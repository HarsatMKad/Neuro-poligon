import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getToken, delToken } from "../utils/tokenStorageController";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "../components/SubscriptionCard";
import axios from "axios";

export default function SubscriptionsPage() {
  const [subArray, setSubArray] = useState([]);
  const [userSub, setUserSub] = useState();
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/api/sub", {
          headers: {
            Authorization: token,
          },
        })
        .then(function (response) {
          setSubArray(response.data.subscriptions);
          setUserSub(response.data.userSub);
        })
        .catch(function (error) {
          if (error.response.status == 400) {
            delToken();
            navigate("/login");
          }
        });
    }
  }, [token]);

  function updateSubHandler(subId) {
    if (token) {
      axios
        .put(
          `http://localhost:3000/api/users/sub/${subId}`,
          {},
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then(function (response) {
          setUserSub(response.data.subscription._id)
        })
        .catch(function (error) {
          console.log(error);
          alert("При покупке подписки произошла ошибка");
        });
    }
  }

  return (
    <div>
      <Header token={token} />
      <div className="subscriptions_list">
        <p>ДОСТУПНЫЕ ПОДПИСКИ</p>
        {subArray.map((substrate, index) => (
          <div className="card" key={index}>
            <SubscriptionCard
              name={substrate.name}
              substrates_max={substrate.substrates_max}
              description={substrate.description}
              lvl={substrate.lvl}
              duration={substrate.duration}
              price={substrate.price}
              isBuy={substrate._id == userSub}
            />
            <div className="button_section">
              <button
                disabled={substrate._id == userSub}
                onClick={() => {
                  updateSubHandler(substrate._id);
                }}
              >
                Купить
              </button>
              <button>Узнать больше</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
