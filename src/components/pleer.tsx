import React from 'react';

interface PlayerProps {
  url: string; 
}

const WebPlayer: React.FC<PlayerProps> = ({ url }) => (
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#000000', 
    borderRadius: 12,           
    overflow: 'hidden',
    position: 'relative', // Включаем относительное позиционирование для коробки
  }}>
    <iframe
      src={url}
      style={{
        position: 'absolute', // Абсолютное позиционирование для iframe
        top: 0,
        left: 0,
        width: '100%',        // Намертво растягиваем по ширине контейнера
        height: '100%',       // Намертво растягиваем по высоте контейнера
        border: 'none',
        backgroundColor: '#000000',
        maxWidth: '100% !important', 
        maxHeight: '100% !important'
      }}
      allowFullScreen
      allow="autoplay; encrypted-media; fullscreen"
    />
  </div>
);

export default WebPlayer;