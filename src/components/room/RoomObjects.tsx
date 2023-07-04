import React, { useState } from "react";
import previewIcon from "../../assets/images/link_preview.svg";
import micOnIcon from "../../assets/images/mic_on.svg";
import micOffIcon from "../../assets/images/mic_off.svg";
import videoOnIcon from "../../assets/images/camera_on.svg";
import videoOffIcon from "../../assets/images/camera_off.svg";

type RoomObjectProps = {
  objects: Array<any>;
  connectedUsers: Array<any>;
  me: any;
  enterRoom(): void;
  toggleMute(): void;
  toggleVideo(): void;
};

export const RoomObjects: React.FC<RoomObjectProps> = ({
  objects,
  enterRoom,
  toggleMute,
  toggleVideo,
  connectedUsers,
  me
}) => {
  const [objectsWithWidth, setObjectsWithWidth] = useState<Array<any>>([]);
  const mobile = window.innerWidth <= 992;

  const getImageFromObject = (object: any, isAvatar: boolean) => {
    if (object && object._id) {
      const path = `../../assets/objects/${isAvatar ? 'avatar' : object?.type}/${isAvatar ? object.avatar : object.name}${object.orientation ? "_" + object.orientation : ""
        }.png`;
      const imageUrl = new URL(path, import.meta.url);

      if (mobile) {
        const img = new Image();
        img.onload = () => {
          const exist = objectsWithWidth.find(
            (o: any) => o.name == object.name
          );

          if (!exist) {
            const newObjects = [
              ...objectsWithWidth,
              { name: object.name, width: img.width },
            ];
            setObjectsWithWidth(newObjects);
          }
        };

        img.src = imageUrl.href;
      }

      return imageUrl.href;
    }
  };

  const getObjectsStyle = (object: any) => {
    const style = { zIndex: object.zIndex } as any;

    if (mobile) {
      const obj = objectsWithWidth.find((o: any) => o.name == object.name);
      if (obj) {
        const width = obj.width * 0.5;
        style.width = width + "px";
      }
    }
    return style;
  };

  const getClassFromObject = (object: any) => {
    let style = "";

    switch (object.y) {
      case 0: {
        style += "row-one ";
        break;
      }
      case 1: {
        style += "row-two ";
        break;
      }
      case 2: {
        style += "row-three ";
        break;
      }
      case 3: {
        style += "row-four ";
        break;
      }
      case 4: {
        style += "row-five ";
        break;
      }
      case 5: {
        style += "row-six ";
        break;
      }
      case 6: {
        style += "row-seven ";
        break;
      }
      case 7: {
        style += "row-eight ";
        break;
      }
      default:
        break;
    }

    switch (object.x) {
      case 0: {
        style += "column-one ";
        break;
      }
      case 1: {
        style += "column-two ";
        break;
      }
      case 2: {
        style += "column-three ";
        break;
      }
      case 3: {
        style += "column-four ";
        break;
      }
      case 4: {
        style += "column-five ";
        break;
      }
      case 5: {
        style += "column-six ";
        break;
      }
      case 6: {
        style += "column-seven ";
        break;
      }
      case 7: {
        style += "column-eight ";
        break;
      }
      default:
        break;
    }

    return style;
  };

  const getName = (user: any) => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }

    return '';
  }

  const getMutedClass = (user: any) => {
    if (user?.muted) {
      return 'muted';
    }

    return '';
  }

  return (
    <div className="container-objects">
      <div className="center">
        <div className="grid">
          {objects?.map((object: any) => (
            <img
              key={object._id}
              src={getImageFromObject(object, false)}
              className={getClassFromObject(object)}
              style={getObjectsStyle(object)}
            />
          ))}
          {
            connectedUsers?.map((user: any) =>
              <div key={user._id} className={'user-avatar ' + getClassFromObject(user)}>
                <div className={getMutedClass(user)}>
                  <span className={getMutedClass(user)}>{getName(user)}</span>
                </div>
                <img
                  src={getImageFromObject(user, true)}
                  style={getObjectsStyle(user)}
                />
              </div>
            )}
          {me?.user && me.muted && <img src={micOffIcon} className="audio" onClick={toggleMute} />}
          {me?.user && !me.muted && <img src={micOnIcon} className="audio" onClick={toggleMute} />}
          {me?.user && me.video && <img src={videoOnIcon} className="video" onClick={toggleVideo} />}
          {me?.user && !me.video && <img src={videoOffIcon} className="video" onClick={toggleVideo} />}
          {(!connectedUsers || connectedUsers?.length === 0) && <div className="preview">
            <img src={previewIcon} alt="Entrar na sala" />
            <button onClick={enterRoom}>Entrar na sala</button>
          </div>}
        </div>
      </div>
    </div>
  );
};
