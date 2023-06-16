import { useState, useEffect } from "react";
import emptyIcon from "../../assets/images/empty_list.svg";
import copyIcon from "../../assets/images/copy.svg";
import { useNavigate, useParams } from "react-router-dom";
import { RoomObjects } from "./RoomObjects";
import { RoomServices } from "../../services/RoomServices";
import { createPeerConnectionContext } from "../../services/WebSocketServices";

const roomServices = new RoomServices();
const wsServices = createPeerConnectionContext();

export const RommHome = () => {
  const navigate = useNavigate();
  const [objects, setObjects] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [me, setMe] = useState<any>({});
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const { link } = useParams();
  const userId = localStorage.getItem('id') || '';

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
    } catch (e) {
      console.log("Ocorreu um erro ao buscar dados da sala", e);
    }
  };

  useEffect(() => {
    getRoom();
  }, []);

  const enterRoom = () => {
    if (!link || !userId) {
      return navigate('/');
    }
    wsServices.joinRoom(link, userId);
    wsServices.onUpdateUserList(async (users: any) => {
      if (users) {
        setConnectedUsers(users);
        localStorage.setItem('connectedUsers', JSON.stringify(users));

        const me = users.find((u: any) => u.user === userId);
        if (me) {
          setMe(me);
          localStorage.setItem('me', JSON.stringify(me));
        }
      }
    })
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

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
              />
            </>
          ) : (
            <div className="empty">
              <img src={emptyIcon} />
              <p>Reunião não encontrada :/</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
