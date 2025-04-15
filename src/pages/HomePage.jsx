import Header from "../components/Header";
import { getToken } from "../utils/tokenStorageController";

export default function HomePage() {
  const token = getToken();
  return (
    <div>
      <Header token={token} />
    </div>
  );
}
