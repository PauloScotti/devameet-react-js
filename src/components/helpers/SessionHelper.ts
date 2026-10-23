
export class SessionHelper {
    // Token vencido ou inválido: limpa a sessão e recarrega na tela de login.
    static expire() {
        localStorage.clear();
        window.location.assign('/');
    }
}
