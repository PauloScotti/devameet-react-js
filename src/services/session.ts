// 401 com sessão ativa significa token expirado ou inválido: a sessão precisa
// ser encerrada. 401 sem token é só uma tentativa de login que falhou.
export function sessionExpired(status: number | undefined, token: string | null): boolean {
    return status === 401 && Boolean(token);
}
