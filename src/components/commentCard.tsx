import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CommentCardProps {
  item: any;
  currentUserId: number | undefined;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onReport: (id: number) => void;
  theme: any;
}

export default function CommentCard({ item, currentUserId, onLike, onDislike, onReport, theme }: CommentCardProps) {
  const [isRevealed, setIsRevealed] = useState(!item.is_spoiler);
  const cardStyles = getCommentCardStyles(theme);

  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
   <View style={cardStyles.card}>
      {/* Хедер карточки: Аватар (заглушка), Имя, Дата */}
      <View style={cardStyles.header}>
        <View style={cardStyles.userInfo}>
          {/* Аватар */}
          <View style={cardStyles.avatarPlaceholder}>
            <Text style={cardStyles.avatarLetter}>
              {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          {/* Контейнер для текста */}
          <View style={cardStyles.textContainer}>
            <View style={cardStyles.nameAndRatingRow}>
              <Text style={cardStyles.username}>
                {item.username || 'Пользователь'}
              </Text>
              
              {/* Оценка справа */}
              {item.rating !== undefined && item.rating !== null && (
                <View style={cardStyles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                  <Text style={cardStyles.ratingText}>{item.rating}/10</Text>
                </View>
              )}
            </View>
            
            <Text style={cardStyles.date}>{formattedDate}</Text>
          </View>
        </View>
        
        {/* Флажок жалобы */}
        {item.user_id !== currentUserId && (
          <TouchableOpacity onPress={() => onReport(item.comment_id)} style={cardStyles.reportBtn} hitSlop={10}>
            <MaterialCommunityIcons name="flag-outline" size={18} color="#cf2727" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Тело комментария или спойлер */}
      {item.is_spoiler && !isRevealed ? (
        <TouchableOpacity 
          onPress={() => setIsRevealed(true)} 
          style={cardStyles.spoilerContainer}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="eye-off-outline" size={20} color="#FF3B30" style={{marginRight: 8}} />
          <Text style={cardStyles.spoilerText}>
            Контент содержит спойлеры. Нажмите, чтобы открыть.
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={cardStyles.commentText}>{item.text}</Text>
      )}

      {/* Футер карточки: Лайк / Дизлайк */}
      <View style={cardStyles.footer}>
        <View style={cardStyles.reactionGroup}>
          <TouchableOpacity onPress={() => onLike(item.comment_id)} style={cardStyles.reactionBtn}>
            <MaterialCommunityIcons 
              name={item.my_reaction === 1 ? "thumb-up" : "thumb-up-outline"} 
              size={18} 
              color={item.my_reaction === 1 ? "#4dff4d" : theme.textSecondary || "#AAA"} 
            />
            <Text style={[cardStyles.reactionText, item.my_reaction === 1 && {color: "#4dff4d"}]}>
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>
          
          <View style={cardStyles.reactionDivider} />

          <TouchableOpacity onPress={() => onDislike(item.comment_id)} style={cardStyles.reactionBtn}>
            <MaterialCommunityIcons 
              name={item.my_reaction === 0 ? "thumb-down" : "thumb-down-outline"} 
              size={18} 
              color={item.my_reaction === 0 ? "#ff4d4d" : theme.textSecondary || "#AAA"} 
            />
            <Text style={[cardStyles.reactionText, item.my_reaction === 0 && {color: "#ff4d4d"}]}>
              {item.dislikes_count || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getCommentCardStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.cardBackground || '#1A1A1A', // Чуть темнее основного фона
    padding: 16,
    borderRadius: 12, // Более мягкие углы
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // центрируем по вертикали весь хедер
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40, // Сделали аватар чуть крупнее
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#AAA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameAndRatingRow: {
    flexDirection: 'row', // Это заставляет имя и оценку встать в один ряд
    alignItems: 'center', // Центрирует звезду по высоте букв имени
  },
  username: {
    fontWeight: 'bold',
    color: theme.text || '#FFFFFF',
    fontSize: 15,
    maxWidth: '70%', // Чтобы длинное имя не наезжало на оценку
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, // Отступ между концом имени и звездой
  },
  ratingText: {
    color: '#FFD700', // Красивый золотой цвет
    fontSize: 15,     // Сделали крупным, под размер имени
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  reportBtn: {
    padding: 6,
    marginLeft: 8,
  },
  commentText: {
    color: theme.text || '#BBB', // Чуть светлее для контраста
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  spoilerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground || '#3D1A1A', // Глубокий темно-красный фон
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.accent || '#FF4D4D', // Ярко-красная рамка
    marginBottom: 8,
  },
  spoilerText: {
    color: '#FF4D4D',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'flex-start',
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground || '#1A1A1A', // Единый фон для группы реакций
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reactionText: {
    color: theme.textSecondary || '#AAA',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    minWidth: 16, // Чтобы счетчик не прыгал
  },
  reactionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#3D3D3D',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground , // Темно-золотой полупрозрачный фон
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: '#FFD700',
  },

});