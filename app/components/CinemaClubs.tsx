import React from 'react';
import { CinemaClub } from '../services/api';

interface CinemaClubsSectionProps {
  title: string;
  clubs: CinemaClub[];
  type: string;
}

const CinemaClubsSection: React.FC<CinemaClubsSectionProps> = ({ title, clubs, type }) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="mr-2">{getIcon(type)}</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map(club => (
          <div key={club.club_id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
            <img 
              src={club.cover_image} 
              alt={club.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{club.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{club.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{club.media_count} фильмов</span>
                <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                  Смотреть
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Иконки для разных типов киноклубов
const getIcon = (type: string) => {
  const icons = {
    genre: '🎭',
    director: '👨‍🎨', 
    mood: '🎯',
    seasonal: '📅',
    trending: '🔥'
  };
  return icons[type as keyof typeof icons] || '🎬';
};

export default CinemaClubsSection;