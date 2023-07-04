import { Footer } from "../components/general/Footer";
import { Header } from "../components/general/Header";
import Loading from "../components/general/Loading";
import { RommHome } from "../components/room/RommHome";

export const RoomView = () => {
  return (
    <>
      <Header />
      <Loading />
      <RommHome />
      <Footer />
    </>
  );
};
