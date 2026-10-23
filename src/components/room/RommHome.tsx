import { useState, useEffect, useRef } from "react";
import emptyIcon from "../../assets/images/empty_list.svg";
import copyIcon from "../../assets/images/copy.svg";
import iconUp from "../../assets/images/chevron_up.svg";
import iconRight from "../../assets/images/chevron_rigth.svg";
import iconLeft from "../../assets/images/chevron_left.svg";
import iconDown from "../../assets/images/chevron_down.svg";
import { useNavigate, useParams } from "react-router-dom";
import { RoomObjects } from "./RoomObjects";
import { RoomServices } from "../../services/RoomServices";
import { createPeerConnectionContext } from "../../services/WebSocketServices";
import { Modal } from "react-bootstrap";
import { VideoTile } from "./VideoTile";

const roomServices = new RoomServices();
const wsServices = createPeerConnectionContext();
let userMediaStream: any;

const videoConstraints = {
  width: { min: 640, ideal: 1280 },
  height: { min: 400, ideal: 1080 },
  aspectRatio: { ideal: 1.7777 },
};

const MEDIA_PERMISSION_MESSAGE = 'Habilite a permissão de áudio para participar das reuniões.';
const CAMERA_PERMISSION_MESSAGE = 'Não foi possível acessar a câmera. Verifique a permissão de vídeo.';

// Câmera é opcional: sem ela (ou sem permissão) entra só com áudio.
const getUserMediaStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
  } catch (e) {
    console.log("Câmera indisponível, entrando apenas com áudio", e);
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  }
};

const setLocalVideo = () => {
  const videoRef = document.getElementById('localVideoRef') as HTMLVideoElement | null;
  if (videoRef) {
    videoRef.srcObject = userMediaStream;
  }
};

export const RommHome = () => {
  const navigate = useNavigate();
  const [objects, setObjects] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [me, setMe] = useState<any>({});
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [modalMessage, setModalMessage] = useState('');
  const [localVideoOn, setLocalVideoOn] = useState(false);
  const togglingVideo = useRef(false);
  const { link } = useParams();
  const userId = localStorage.getItem('id') || '';

  const mobile = window.innerWidth <= 992;

  const getRoom = async () => {
    try {
      if (!link) {
        return navigate("/");
      }

      const result = await roomServices.getRoomByLink(link);

      if (!result || !result.data) {
        return;
      }

      const { color, name, objects } = result.data;

      setName(name);
      setColor(color);

      const newObjects = objects.map((o: any) => {
        return { ...o, type: o?.name.split("_")[0] };
      });

      setObjects(newObjects);

      userMediaStream = await getUserMediaStream();
      setLocalVideoOn(userMediaStream.getVideoTracks().length > 0);
      setLocalVideo();
    } catch (e) {
      console.log("Ocorreu um erro ao buscar dados da sala", e);
    }
  };

  useEffect(() => {
    getRoom();
  }, []);

  useEffect(() => {
    document.addEventListener('keyup', (event: any) => doMovement(event));

    return () => {
      document.removeEventListener('keyup', (event: any) => doMovement(event));
    }
  }, []);

  const enterRoom = () => {
    if (!userMediaStream) {
      return setModalMessage(MEDIA_PERMISSION_MESSAGE);
    }

    if (!link || !userId) {
      return navigate('/');
    }
    wsServices.joinRoom(link, userMediaStream.getVideoTracks().length > 0);
    wsServices.onCallMade();
    wsServices.onUpdateUserList(async (users: any) => {
      if (users) {
        setConnectedUsers(users);
        localStorage.setItem('connectedUsers', JSON.stringify(users));

        const me = users.find((u: any) => u.user === userId);
        if (me) {
          setMe(me);
          localStorage.setItem('me', JSON.stringify(me));
        }

        const getUsersWithoutMe = users.filter((u: any) => u.user !== userId);
        for (const user of getUsersWithoutMe) {
          wsServices.addPeerConnection(user.clientId, userMediaStream, (_stream: any) => {
            if (document.getElementById(user.clientId)) {
              const videoRef: any = document.getElementById(user.clientId);
              videoRef.srcObject = _stream;
            }
          });
        }
      }
    });
    wsServices.onRemoveUserList((socketId: any) => {
      const connectedStr = localStorage.getItem('connectedUsers') || '';
      const connectedUsers = JSON.parse(connectedStr);
      const filtered = connectedUsers?.filter((u: any) => u.clientId !== socketId);
      setConnectedUsers(filtered);
      wsServices.removePeerConnection(socketId);
    });

    wsServices.onAddUser((user: any) => {

      wsServices.addPeerConnection(user, userMediaStream, (_stream: any) => {
        if (document.getElementById(user)) {
          const videoRef: any = document.getElementById(user);
          videoRef.srcObject = _stream;
        }
      });

      wsServices.callUser(user);
    });

    wsServices.onAnswerMade((socket: any) => wsServices.callUser(socket));
  }

  const toggleMute = () => {
    const payload = {
      userId,
      link,
      muted: !me.muted
    }

    wsServices.updateUserMute(payload);
  }

  const toggleVideo = async () => {
    if (!userMediaStream || togglingVideo.current) {
      return;
    }

    togglingVideo.current = true;
    const video = me.video === false;

    try {
      if (video) {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        const [track] = cameraStream.getVideoTracks();
        userMediaStream.addTrack(track);
        await wsServices.replaceVideoTrack(track);
      } else {
        userMediaStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          userMediaStream.removeTrack(track);
        });
        await wsServices.replaceVideoTrack(null);
      }

      setLocalVideo();
      setLocalVideoOn(video);
      wsServices.updateUserVideo({ video });
    } catch (e) {
      console.log("Ocorreu um erro ao alternar a câmera", e);
      setModalMessage(CAMERA_PERMISSION_MESSAGE);
    } finally {
      togglingVideo.current = false;
    }
  }

  const doMovement = (event: any) => {
    const meStr = localStorage.getItem('me') || '';
    const user = JSON.parse(meStr);

    if (event && user) {
      const payload = {
        userId,
        link
      } as any;

      switch (event.key) {
        case 'ArrowUp':
          payload.x = user.x;
          payload.orientation = 'back';
          if (user.orientation === 'back') {
            payload.y = user.y > 1 ? user.y - 1 : 1;
          } else {
            payload.y = user.y;
          }
          break;
        case 'ArrowDown':
          payload.x = user.x;
          payload.orientation = 'front';
          if (user.orientation === 'front') {
            payload.y = user.y < 7 ? user.y + 1 : 7;
          } else {
            payload.y = user.y;
          }
          break;
        case 'ArrowLeft':
          payload.y = user.y;
          payload.orientation = 'left';
          if (user.orientation === 'left') {
            payload.x = user.x > 0 ? user.x - 1 : 0;
          } else {
            payload.x = user.x;
          }
          break;
        case 'ArrowRight':
          payload.y = user.y;
          payload.orientation = 'right';
          if (user.orientation === 'right') {
            payload.x = user.x < 7 ? user.x + 1 : 7;
          } else {
            payload.x = user.x;
          }
          break;
        default: break;
      }

      if (payload.x >= 0 && payload.y >= 0 && payload.orientation) {
        wsServices.updateUserMovement(payload);
      }
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const localUser = {
    name: localStorage.getItem('name'),
    avatar: localStorage.getItem('avatar'),
    video: localVideoOn,
  };

  const getUsersWithoutMe = () => {
    return connectedUsers.filter((u: any) => u.user !== userId);
  }

  return (
    <>
      <div className="container-principal">
        <div className="container-room">
          {objects?.length > 0 ? (
            <>
              <div className="resume">
                <div onClick={copyLink}>
                  <span>
                    <strong>Reunião </strong>
                    {link}
                  </span>
                  <img src={copyIcon} />
                </div>
                <p style={{ color }}>{name}</p>

              </div>
              <RoomObjects
                objects={objects}
                enterRoom={enterRoom}
                connectedUsers={connectedUsers}
                me={me}
                toggleMute={toggleMute}
                toggleVideo={toggleVideo}
              />

              <div className="videos">
                <VideoTile id="localVideoRef" user={me?.user ? me : localUser} muted />
                {getUsersWithoutMe()?.map((user: any) =>
                  <VideoTile key={user.clientId} id={user.clientId} user={user} muted={user?.muted} />
                )}
              </div>
              {mobile && me?.user &&
                <div className="movement">
                  <div className={"button"} onClick={() => doMovement({ key: 'ArrowUp' })}>
                    <img src={iconUp} alt="Andar para cima" />
                  </div>
                  <div className="line">
                    <div className={"button"} onClick={() => doMovement({ key: 'ArrowLeft' })}>
                      <img src={iconLeft} alt="Andar para esquerda" />
                    </div>
                    <div className={"button"} onClick={() => doMovement({ key: 'ArrowDown' })}>
                      <img src={iconDown} alt="Andar para baixo" />
                    </div>
                    <div className={"button"} onClick={() => doMovement({ key: 'ArrowRight' })}>
                      <img src={iconRight} alt="Andar para direita" />
                    </div>
                  </div>
                </div>
              }
            </>
          ) : (
            <div className="empty">
              <img src={emptyIcon} />
              <p>Reunião não encontrada :/</p>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={!!modalMessage}
        onHide={() => setModalMessage('')}
        className="container-modal"
      >
        <Modal.Body>
          <div className="content">
            <div className="center">
              <span>Aviso!</span>
              <p>{modalMessage}</p>
            </div>
            <div className="actions">
              <button onClick={() => setModalMessage('')}>Ok</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
