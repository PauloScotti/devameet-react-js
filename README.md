# Devameet — Web (React)

Interface web de salas de reunião virtuais, no estilo Gather: o usuário monta salas posicionando objetos em um mapa e os participantes entram, se movem pelo espaço e conversam por áudio e vídeo.

Feita com React e Vite, consome a [API do Devameet](https://github.com/PauloScotti/devameet-nest-js) por HTTP e por WebSocket (socket.io); o áudio e o vídeo trafegam direto entre os navegadores por WebRTC. Nasceu como projeto da formação Devaria e foi atualizada para as versões atuais do React e do Vite.

## Stack

| Camada     | Tecnologia                            |
| ---------- | ------------------------------------- |
| Framework  | React 19, React Router 7              |
| Build      | Vite 8, TypeScript                    |
| Estilos    | Sass, Bootstrap 5                     |
| Tempo real | socket.io-client e WebRTC             |
| HTTP       | axios                                 |
| Testes     | Vitest                                |

## Como rodar

```bash
npm install
cp .env.example .env   # preencha os dois endereços
npm run dev
```

| Variável              | Para quê                                      |
| --------------------- | --------------------------------------------- |
| `VITE_PUBLIC_API_URL` | Endereço da API, sem `/api` no fim            |
| `VITE_PUBLIC_WS_URL`  | Endereço do WebSocket (normalmente o mesmo)   |

O navegador só libera câmera e microfone em `localhost` ou em HTTPS.

## Telas

| Rota            | O que é                                             |
| --------------- | --------------------------------------------------- |
| `/`             | Login ou, com sessão ativa, a lista de reuniões     |
| `/register`     | Criar conta e escolher o avatar                     |
| `/user`         | Editar nome e avatar                                |
| `/add`          | Criar reunião e montar a sala (só em telas grandes) |
| `/edit/:meetId` | Editar a sala (só em telas grandes)                 |
| `/link`         | Entrar em uma reunião pelo link (só no celular)     |
| `/room/:link`   | A sala em si                                        |

## Estrutura

```
src/assets/      estilos, imagens e os objetos das salas
src/components/  componentes por área (geral, reunião, sala)
src/router/      rotas, conforme a sessão e o tamanho da tela
src/services/    chamadas à API, WebSocket e WebRTC
src/views/       telas
```

## Verificação

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

## Sessão

O token fica no `localStorage` e vai no cabeçalho `Authorization` de cada requisição. Quando a API responde 401 com uma sessão ativa (token expirado ou inválido), a sessão é encerrada e o usuário volta para o login.
