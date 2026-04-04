import React from 'react';

interface PlayerProps {
  kpId: string | number;
}

const WebPlayer: React.FC<PlayerProps> = ({ kpId }) => (
  <iframe
    src={`https://kinovibe.vip/embed/kinopoisk/${kpId}/`}
    style={{
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: 12, 
    }}
    allowFullScreen
    allow="autoplay; encrypted-media; fullscreen"
  />
);

export default WebPlayer;