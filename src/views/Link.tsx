import { Footer } from "../components/general/Footer"
import { Header } from "../components/general/Header"
import Loading from "../components/general/Loading"
import { RoomLink } from "../components/room/RoomLink"

export const LinkView = () => {

    return (
        <>
            <Header />
            <Loading />
            <RoomLink />
            <Footer />
        </>
    )
}