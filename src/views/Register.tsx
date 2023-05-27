import logo from '../assets/images/logo.svg';
import loginIcon from '../assets/images/mail.svg';
import userIcon from '../assets/images/user.svg';
import editAvatar from '../assets/images/edit_avatar.svg';
import avatar from '../assets/images/avatar.svg';
import passwordIcon from '../assets/images/key.svg';
import { PublicInput } from '../components/general/PublicInput';
import { useState } from 'react';
import { RegisterServices } from '../services/RegisterServices';
import { Link, useNavigate } from 'react-router-dom';
import { AvatarInput } from '../components/general/AvatarInput';

const registerServices = new RegisterServices();

export const Register = () => {

    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const doRegister = async () => {
        try {
            setError('');
            if (!image || image.trim().length < 1
                || !email || email.trim().length < 5
                || !name || name.trim().length < 2
                || !password || password.trim().length < 4
                || !confirm || confirm.trim().length < 4
            ) {
                return setError('Favor preencher os campos corretamente');
            }

            if (password !== confirm) {
                return setError('Senha e confirmação não são iguais');
            }

            const body = {
                name,
                email,
                password,
                avatar: image
            }

            setLoading(true);
            await registerServices.register(body);
            setLoading(false);
            return navigate('/?sucess=true');
        } catch (e: any) {
            console.log('Erro ao efetuar o cadastro', e);
            setLoading(false);
            if (e?.response?.data?.message) {
                return setError(e?.response?.data?.message);
            }
            return setError('Erro ao efetuar o cadastro, tente novamente');
        }
    }

    return (
        <div className="container-public register">
            <img src={logo} alt='Logo Devameet' className='logo' />
            <form>
                {error && <p className='error'>{error}</p>}

                <AvatarInput image={image} setImage={setImage} />

                <PublicInput
                    icon={userIcon}
                    alt='Nome'
                    name='Nome'
                    type='text'
                    modelValue={name}
                    setValue={setName}
                />
                <PublicInput
                    icon={loginIcon}
                    alt='Email'
                    name='Email'
                    type='text'
                    modelValue={email}
                    setValue={setEmail}
                />
                <PublicInput
                    icon={passwordIcon}
                    alt='Senha'
                    name='Senha'
                    type='password'
                    modelValue={password}
                    setValue={setPassword}
                />
                <PublicInput
                    icon={passwordIcon}
                    alt='Confirme a senha'
                    name='Confirme a senha'
                    type='password'
                    modelValue={confirm}
                    setValue={setConfirm}
                />

                <button type='button' onClick={doRegister} disabled={loading}>
                    {loading ? '...Carregando' : 'Cadastrar'}
                </button>

                <div className='link'>
                    <p>Já possui uma conta?</p>
                    <Link to='/'>Faça seu login agora!</Link>
                </div>
            </form>
        </div>
    )
}