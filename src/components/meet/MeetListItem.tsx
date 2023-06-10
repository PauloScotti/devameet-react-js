import roomIcon from '../../assets/images/room.svg';
import copyIcon from '../../assets/images/copy.svg';
import editIcon from '../../assets/images/edit.svg';
import trashIcon from '../../assets/images/trash.svg';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type MeetListItemProps = {
    meet: any,
    selected: string,
    selectMeet(meet: any): void,
    selectToRemove(id: string): void
}

export const MeetListItem: React.FC<MeetListItemProps> = ({ meet, selectToRemove, selectMeet, selected }) => {
    const mobile = window.innerWidth <= 992;

    const navigate = useNavigate();

    const goToRoom = () => {
        navigate('/room/' + meet?.link);
    }

    const goToEdit = () => {
        navigate('/edit/' + meet?.id);
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window?.location?.href + 'room/' + meet?.link)
    }

    return (
        <div className="container-meet-list-item">
            <div className="meet" onClick={() => selectMeet(meet)} >
                <div className="color" style={{ backgroundColor: meet.color }}></div>
                <span className={selected === meet?.id ? 'selected' : ''}>{meet.name}</span>
            </div>
            <div className="actions">
                {mobile && <img src={roomIcon} alt='Entrar na reunião' onClick={goToRoom} />}
                <img src={copyIcon} alt='Copiar link da reunião' onClick={copyLink} />
                {!mobile && <img src={editIcon} alt='Editar reunião' onClick={goToEdit} />}
                <img src={trashIcon} alt='Deletar reunião' onClick={() => selectToRemove(meet?.id)} />
            </div>
        </div>
    )
}