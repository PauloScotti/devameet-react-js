import { Footer } from "../components/general/Footer";
import { Header } from "../components/general/Header";
import Loading from "../components/general/Loading";
import { MeetEdit } from "../components/meet/MeetEdit";


export const MeetEditView = () => {
    return (
        <>
            <Header />
            <Loading />
            <MeetEdit />
            <Footer />
        </>
    );
}