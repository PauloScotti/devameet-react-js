import { Footer } from "../components/general/Footer";
import { Header } from "../components/general/Header"
import Loading from "../components/general/Loading";
import { MeetHome } from "../components/meet/MeetHome";


export const Home = () => {
    return (
        <>
            <Header />
            <Loading />
            <MeetHome />
            <Footer />
        </>
    );
}