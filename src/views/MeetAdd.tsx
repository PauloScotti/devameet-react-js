import { Footer } from "../components/general/Footer";
import { Header } from "../components/general/Header";
import Loading from "../components/general/Loading";
import { MeetAdd } from "../components/meet/MeetAdd";


export const MeetAddView = () => {
    return (
        <>
            <Header />
            <Loading />
            <MeetAdd />
            <Footer />
        </>
    );
}