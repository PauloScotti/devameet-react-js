import homeIcon from '../../assets/images/home.svg';
import linkIcon from '../../assets/images/link.svg';
import avatarIcon from '../../assets/images/avatar.svg';
import homeIconActive from '../../assets/images/home_active.svg';
import linkIconActive from '../../assets/images/link_active.svg';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const mobile = window.innerWidth <= 992;

    const avataImage = () => {
        const avatar = localStorage.getItem('avatar');
        if (avatar) {
            const path = `../../assets/objects/avatar/${avatar}_front.png`;
            const imageUrl = new URL(path, import.meta.url);
            return imageUrl.href;
        }

        return avatarIcon;
    }

    const getIcon = (name: string) => {
        switch (name) {
            case 'home':
                if (location.pathname !== '/user' &&
                    location.pathname !== '/link' &&
                    !location.pathname.includes('/room')) {
                    return homeIconActive;
                }
                return homeIcon;
            case 'room':
                if (location.pathname === '/link' ||
                    location.pathname.includes('/room')) {
                    return linkIconActive;
                }
                return linkIcon;

            default:
                return '';
        }
    }

    const getSelectedClass = () => {
        if (location.pathname === '/user') {
            return 'selected';
        }

        return '';
    }

    return (
        <div className='container-navigation'>
            <ul>
                <li>
                    <img src={getIcon('home')} alt='Minhas reuniões' className='iconNav' onClick={() => navigate('/')} />
                </li>

                {mobile ?
                    <li>
                        <img src={getIcon('room')} alt='Entrar na reunião' className='iconNav' onClick={() => navigate('/link')} />
                    </li>
                    :
                    <li className='disabled'>
                        <img src={getIcon('room')} alt='Entrar na reunião' className='iconNav' />
                    </li>
                }
                <li>
                    <div className={'avatar mini ' + getSelectedClass()} onClick={() => navigate('/user')} >
                        <img src={avataImage()} alt='Editar unuário' />
                    </div>
                </li>
            </ul>
        </div>
    );
}