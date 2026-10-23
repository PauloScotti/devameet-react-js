import React from "react";

type VideoTileProps = {
  id: string;
  user: any;
  muted: boolean;
};

export const VideoTile: React.FC<VideoTileProps> = ({ id, user, muted }) => {
  const videoOff = user?.video === false;
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="video-tile">
      {/* O <video> continua montado com a câmera desligada para manter o srcObject e o áudio do peer. */}
      <video id={id} playsInline autoPlay muted={muted} hidden={videoOff} />
      {videoOff &&
        <div className="video-off">
          {user?.avatar &&
            <img
              src={new URL(`../../assets/objects/avatar/${user.avatar}_front.png`, import.meta.url).href}
              alt={`Avatar de ${firstName}`}
            />
          }
          <span>{firstName}</span>
        </div>
      }
    </div>
  );
};
