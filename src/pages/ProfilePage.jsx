import Header from "../components/Header";
import ProfileInfo from "../components/ProfileInfo";
import { getToken } from "../utils/tokenStorageController";

export default function ProfilePage() {
  const token = getToken();

  return (
    <div>
      <Header token={token}/>
      <ProfileInfo token={token}/>
    </div>
  );
}
