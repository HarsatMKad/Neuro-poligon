import { useState } from "react";
import Header from "../components/Header";
import ProfileInfo from "../components/ProfileInfo";
import { getToken } from "../utils/tokenStorageController";

export default function ProfilePage() {
  const token = getToken();

  const [responseMessage, setResponseMessage] = useState({message: "", color: "green"})

  return (
    <div>
      <Header token={token} />
      <div style={{ color: responseMessage.color }}>{responseMessage.message}</div>
      <ProfileInfo responseMessageHandler={setResponseMessage} token={token} />
    </div>
  );
}
