import React from 'react';

interface PlayerProps {
  url: string; 
}

const WebPlayer: React.FC<PlayerProps> = ({ url}) => (
  <iframe
    src={url}
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