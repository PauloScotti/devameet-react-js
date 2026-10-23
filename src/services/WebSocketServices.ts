import { io } from 'socket.io-client';

function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

class PeerConnectionSession {

    _room?: string;
    _userId?: string;
    socket: any;
    peerConnections = {} as any;
    remoteStreams = {} as Record<string, MediaStream>;
    senders = [] as any;
    listener = [] as any;
    ons = [] as any;

    constructor(socket: any) {
        this.socket = socket
    }

    joinRoom(link: string, userId: string) {
        this._room = link;
        this._userId = userId;
        this.socket.emit('join', { link, userId });
    }

    onUpdateUserList(callback: any) {
        this.socket.on(`${this._room}-update-user-list`, ({ users }: any) => {
            callback(users);
        });
    }

    onRemoveUserList(callback: any) {
        this.socket.on(`${this._room}-remove-user`, ({ socketId }: any) => {
            callback(socketId);
        });
    }

    updateUserMovement(data: any) {
        this.socket.emit('move', data);
    }

    updateUserMute(data: any) {
        this.socket.emit('toggl-mute-user', data);
    }

    updateUserVideo(data: any) {
        this.socket.emit('toggl-video-user', data);
    }

    addPeerConnection(id: string, stream: any, callback: any) {
        if (!this.peerConnections[id]) {

            this.peerConnections[id] = new window.RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            stream.getTracks().forEach((track: any) => {
                this.senders.push(this.peerConnections[id].addTrack(track, stream));
            });

            // Câmera desligada: reserva o canal de vídeo para ligar depois via replaceTrack, sem renegociar.
            if (stream.getVideoTracks().length === 0) {
                this.peerConnections[id].addTransceiver('video', { direction: 'sendrecv', streams: [stream] });
            }

            this.listener[id] = (event: any) => {
                const on = '_on' + capitalizeFirstLetter(this.peerConnections[id].connectionState);
                const fn = this.ons[on];
                fn && fn(event, id);
            }

            this.peerConnections[id].addEventListener('connectionstatechange', this.listener[id]);

            // Stream próprio por peer: o track de vídeo pode chegar sem msid quando o peer entrou com a câmera desligada.
            this.remoteStreams[id] = new MediaStream();
            this.peerConnections[id].ontrack = ({ track }: RTCTrackEvent) => {
                this.remoteStreams[id].addTrack(track);
                callback(this.remoteStreams[id]);
            }
        }
    }

    removePeerConnection(id: string) {
        if (this.peerConnections[id]) {
            this.peerConnections[id].removeEventListener('connectionstatechange', this.listener[id]);
            this.peerConnections[id].close();
            delete this.peerConnections[id];
            delete this.remoteStreams[id];
            delete this.listener[id];
        }
    }

    async replaceVideoTrack(track: MediaStreamTrack | null) {
        const videoSenders = Object.values(this.peerConnections)
            .flatMap((pc: any) => pc.getTransceivers())
            .filter((transceiver: RTCRtpTransceiver) => transceiver.receiver.track.kind === 'video')
            .map((transceiver: RTCRtpTransceiver) => transceiver.sender);

        await Promise.all(videoSenders.map((sender: RTCRtpSender) => sender.replaceTrack(track)));
    }

    onAddUser(callback: any) {
        this.socket.on(`${this._room}-add-user`, ({ user }: any) => {
            callback(user);
        });
    }

    async callUser(to: any) {
        if (this.peerConnections[to].iceConnectionState === 'new') {
            const offer = await this.peerConnections[to].createOffer();
            await this.peerConnections[to].setLocalDescription(new RTCSessionDescription(offer));
            this.socket.emit('call-user', { offer, to, link: this._room });
        }
    }

    async onCallMade() {
        this.socket.on(`call-made`, async (data: any) => {

            const selectedPeer = this.peerConnections[data.socket];
            if (selectedPeer) {
                await selectedPeer.setRemoteDescription(new RTCSessionDescription(data.offer));
                // Sem track local de vídeo o transceiver criado pela oferta fica recvonly; libera o envio para o replaceTrack.
                selectedPeer.getTransceivers()
                    .filter((t: RTCRtpTransceiver) => t.receiver.track.kind === 'video' && t.direction === 'recvonly')
                    .forEach((t: RTCRtpTransceiver) => { t.direction = 'sendrecv'; });
                const answer = await selectedPeer.createAnswer();
                await selectedPeer.setLocalDescription(new RTCSessionDescription(answer));
                this.socket.emit('make-answer', {
                    answer,
                    to: data.socket,
                    link: this._room
                });
            }
        });
    }

    onAnswerMade(callback: any) {
        this.socket.on('answer-made', async (data: any) => {
            await this.peerConnections[data.socket].setRemoteDescription(new RTCSessionDescription(data.answer));
            callback(data.socket);
        })
    }
}

export const createPeerConnectionContext = () => {
    const { VITE_PUBLIC_WS_URL } = import.meta.env;

    const socket = io(VITE_PUBLIC_WS_URL);

    return new PeerConnectionSession(socket);
}