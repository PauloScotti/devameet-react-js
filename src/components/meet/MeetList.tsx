import { useEffect, useState } from "react";
import emptyIcon from '../../assets/images/empty_list.svg';
import { MeetServices } from "../../services/MeetServices";
import { MeetListItem } from "./MeetListItem";
import { Modal } from "react-bootstrap";

const meetServices = new MeetServices();

type MeetListProps = {
    setObjects(o: any): void,
    setLink(s: string): void
}

export const MeetList: React.FC<MeetListProps> = ({ setObjects, setLink }) => {

    const [meets, setMeets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const getMeets = async () => {
        try {
            const result = await meetServices.getMeets();
            if (result?.data) {
                setMeets(result.data);
            }
        } catch (e) {
            console.log('Ocorreu erro ao listar reuniões', e);
        }
    }

    const removeMeet = async () => {
        try {
            if (!selected) {
                return;
            }
            await meetServices.deleteMeets(selected);
            await getMeets();
            cancelSelection();
        } catch (e) {
            console.log('Ocorreu erro ao excluir reuniões', e);
        }
    }

    const selectToRemove = (id: string) => {
        setSelected(id);
        setShowModal(true);
    }

    const cancelSelection = () => {
        setSelected(null);
        setShowModal(false)
    }

    const selectMeetWithObjects = async (meet: any) => {
        try {

            const obhectsResult = await meetServices.getMeetObjectsById(meet?.id);

            if (obhectsResult.data) {
                const newObjects = obhectsResult?.data?.map((e: any) => {
                    return { ...e, type: e?.name?.split('_')[0] }
                });
                setObjects(newObjects);
                setSelected(meet?.id);
                setLink(meet?.link);
            }
        } catch (e) {
            console.log('Ocorreu erro ao listar objetos da reunião', e);
        }
    }

    useEffect(() => {
        getMeets();
    }, [])

    return (
        <>
            <div className="container-meet-list">
                {meets && meets.length > 0
                    ?
                    meets.map((meet: any) => <MeetListItem key={meet.id}
                        meet={meet}
                        selectToRemove={selectToRemove}
                        selectMeet={selectMeetWithObjects}
                        selected={selected || ''}
                    />)
                    :
                    <div className="empty">
                        <img src={emptyIcon} />
                        <p>Você ainda não possui reuniões criadas :&#40;</p>
                    </div>
                }
            </div>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                className="container-modal"
            >
                <Modal.Body>
                    <div className="content">
                        <div className="center">
                            <span>Deletar reunião</span>
                            <p>Deseja deletar a reunião?</p>
                            <p>Essa ação não poderá ser desfeita.</p>
                        </div>
                        <div className="actions">
                            <span onClick={cancelSelection}>Cancelar</span>
                            <button onClick={removeMeet}>Confirmar</button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}