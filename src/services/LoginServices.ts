import { HttpApiServices } from "./HttpApiServices";

export class LoginServices extends HttpApiServices {
    async login(body: any, setToken: any) {
        const { data } = await this.post('/auth/login', body);

        if (data) {
            localStorage.setItem('email', data.email);
            localStorage.setItem('token', data.token);
            setToken(data.token);

            const userResponse = await this.get('/user');
            if (userResponse && userResponse.data) {
                const user = userResponse.data;

                localStorage.setItem('id', user.id);
                localStorage.setItem('nome', user.nome);

                if (user.avatar) {
                    localStorage.setItem('avatar', user.avatar);
                }
            }

        }
    }

    logout() {
        localStorage.clear();
    }
}