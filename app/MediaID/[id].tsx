import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions, Image, Platform, ScrollView, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import WebView from 'react-native-webview';
import Header from '../../src/components/Header';
import SideMenu from '../../src/components/SideMenu';
import { useAuth } from '../../src/context/AuthContext';
import { useMediaById } from '../../src/hooks/useMedia';
import { commentAPI, userAPI } from '../../src/services/api';
import { CONFIG } from '../../src/services/constants';
import { MediaComment } from '../../types/media.types';

const { width: screenWidth } = Dimensions.get('window');
const VIDEO_WIDTH = screenWidth > 800 ? 800 : screenWidth - 40; 
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { media, loading } = useMediaById(id as string);
  const { user, isAuth, isLoading: authLoading } = useAuth();
  
  const userId = user?.id;

  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  //Отслеживания состония кнопки "Показать полностью"
  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedRating, setSelectedRating] = useState(media?.user_rating || 0);
  const [isHovering, setIsHovering] = useState(false);
  const [comment, setComment] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [userCommentId, setUserCommentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<MediaComment[]>([]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (media) {
      //Синхронизируем рейтинг пользователя
      if (media.user_rating !== undefined) {
        setSelectedRating(media.user_rating);
      }

      fetchComments(id)
      // Определяем массив источников
      let potentialSources = media.type === 'tv_series' 
        ? selectedEpisode?.sources 
        : media.video;

      const videoSources = potentialSources?.filter((s: any) => s.type_name !== 'trailer') || [];

      // 4. Устанавливаем выбранный источник
      if (videoSources.length > 0) {
        setSelectedSource(videoSources[0]);
      } else {
        setSelectedSource(null);
      }
    }
  }, [media, selectedEpisode]); 

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };
  
  const SERVER_URL = CONFIG.SERVER_URL;

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http')) return posterPath;
    if (posterPath.startsWith('/')) return `${SERVER_URL}${posterPath}`;
    return `${SERVER_URL}/${posterPath}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.container}>
        <Header title="Ошибка" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Медиа-контент не найден</Text>
        </View>
      </View>
    );
  }

  // Фильтруем основные плееры (фильм или серия)
  const videoSources = media.type === 'tv_series' 
    ? selectedEpisode?.sources?.filter((s: any) => s.source_type !== 'trailer')
    : media.video?.filter((s: any) => s.source_type !== 'trailer');

  // Фильтруем трейлеры и кадры
  const mediaContent = [
    ...(media.extras?.filter(item => item.type_name === 'trailer') || []),
    ...(media.extras?.filter(item => item.type_name === 'screenshot') || [])
  ];

  const renderExternalPlayer = (url: string | null, customHeight?: number) => {
      if (!url) {
        return (
          <View style={[styles.playerPlaceholder, customHeight ? { height: customHeight } : { height: VIDEO_HEIGHT }]}>
            <Text style={styles.noVideoText}>Видео временно недоступно</Text>
          </View>
        );
      }

      return (
        <View style={[styles.playerContainer, { height: customHeight || VIDEO_HEIGHT }]}>
          {Platform.OS === 'web' ? (
            <iframe
              src={url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
            />
          ) : (
            <WebView
              source={{ uri: url }}
              style={{ flex: 1, backgroundColor: '#000' }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
            />
          )}
        </View>
      );
    };

  const renderSourcePicker = (sources: any[], currentSource: any, onSelect: (s: any) => void, label: string) => {
    if (!sources || sources.length <= 1) return null;

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>{label}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
          {sources.map((source, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerBtn, 
                currentSource?.url === source.url && styles.pickerBtnActive
              ]}
              onPress={() => onSelect(source)}
            >
              <Text style={styles.pickerBtnText}>
                {source.player_name?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const displayTitle = (media.season_title && media.season_title.trim())
    ? `${media.main_title}: ${media.season_title}`
    : media.main_title;

  const formatDuration = (totalMinutes: number | null) => {
    if (!totalMinutes) return 'н/д'; // Если данных нет

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
    }

    // Если меньше часа, показываем только минуты
    return `${minutes} мин`;
  };

  const directors = media.people?.filter(person => person.role_name === 'Режиссёр') || [];

  const MainActors = media.people?.filter(person => person.role_name === 'Главный актёр') || [];

  const handleRate = async (score: number) => {
    const previousRating = selectedRating; // Сохраняем на случай ошибки

    try {
      // Оптимистичное обновление (мгновенно меняем UI)
      setSelectedRating(score);
      setIsHovering(false);

      //Отправка на сервер через API
      const response = await userAPI.setMediaRating(Number(id), score);
      console.log("Ответ от сервера:", response);

      if (response.data.success) {
        console.log("Оценка сохранена:", response.data.newRating);
      }
    } catch (error) {
      // 3. Откат, если что-то пошло не так
      setSelectedRating(previousRating);
      console.error("Ошибка при сохранении оценки:", error);
      alert("Не удалось сохранить оценку. Проверьте соединение.");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return '#fff'; 
    if (rating <= 3) return '#ff4d4d'; 
    if (rating <= 7) return '#ffc107';
    return '#4dff4d'; 
  };

  const fetchComments = async (id: string | string[]) => {
    try {
      const data = await commentAPI.getComments(Number(id));
      setComments(data);

      const myComment = data.find((c: any) => c.user_id === userId);
      
      if (myComment) {
        setUserCommentId(myComment.id); 
        setComment(myComment.text);    
        setIsSpoiler(myComment.is_spoiler);
        setIsEditing(true);             
      } else {
        setIsEditing(false);
        setUserCommentId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendComment = async () => {
    if (comment.trim() === '') {
      alert("Комментарий не может быть пустым");
      return;
    }

    if (comment.trim().length < 2) {
      alert("Комментарий слишком короткий");
      return;
    }

    console.log(userId)

    if (!isAuth || !userId) {
      alert("Войдите в аккаунт, чтобы оставить отзыв");
      return;
    }


    try {
      // Запрос к API
      const response = await commentAPI.sendComment(
        +id,
        userId,
        comment,
        isSpoiler 
      );

      if (response.success) {
        alert("Комментарий успешно добавлен!");
        setComment(""); 
        fetchComments(id); 
      }
    } catch (error: any) {
      // Обработка того самого ограничения (один пользователь - один коммент)
      const errorMsg = error.response?.data?.message || "Ошибка при отправке";
      alert(errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={displayTitle} 
        showBackButton={true}
        onMenuPress={handleMenuPress}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.heroSection,
          Platform.OS === 'web' ? styles.heroSectionWeb : styles.heroSectionMobile
        ]}>
          <Image 
            source={{ 
              uri: getPosterUrl(media.poster_url)
            }} 
            style={styles.poster}
          />

          <View style={styles.heroContent }>
            <View style={styles.titleContainer}>
              <View>
                <Text style={styles.title}>{displayTitle} </Text>
                <Text style={styles.Origtitle}>{media.original_title || ' '}</Text>
              </View>
              
              <View style={styles.ratingWrapper}>
                <TouchableOpacity 
                  style={styles.userRateBtn} 
                  onPress={() => setIsHovering(!isHovering)} // Переключаем видимость звезд
                  activeOpacity={0.8}
                >
                  <Text style={[styles.starIcon, { color: getRatingColor(selectedRating) }]}>
                    {selectedRating > 0 ? '★' : '☆'}
                  </Text>
                  <Text style={styles.userRateText}>
                    {selectedRating > 0 ? `${selectedRating} ваша оценка` : 'Оценить'}
                  </Text>
                
                </TouchableOpacity>

                {/* Выезжающая панель со звездами */}
                {isHovering && (
                  <View style={styles.starsDropdown}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => handleRate(star)}
                        style={styles.starTouch}
                      >
                        <Text style={[
                          styles.starSmall,
                          selectedRating >= star ? styles.starYellow : styles.starGray
                        ]}>
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.ratingsRow}>
              <Text style={styles.rating}>
                IMDb: ⭐ {media.imdb_rating || 'N/A'}
              </Text>
              <Text style={styles.ratingSeparator}>|</Text>
              <Text style={styles.rating}>
                Кинопоиск: ⭐ {media.kinopoisk_rating || 'N/A'}
              </Text>
              <Text style={styles.ratingSeparator}>|</Text>
              <Text style={styles.rating}>
                Выбор наших: ⭐ {media.average_rating ? Number(media.average_rating) : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Тип</Text>
              <Text style={styles.infoValue}>{media.type === 'movie' ? 'Фильм' : 'Сериал'}</Text>
            </View>

            {media.type === 'tv_series' && media.seasons && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Cезонов: </Text>
                <Text style={styles.infoValue}>{media.seasons.length}</Text>
              </View>
            )}

            {media.type === 'tv_series' && selectedSeason?.episode_count && (
              <Text style={styles.type}>Серий в сезоне: {selectedSeason.episode_count} / {}</Text>
            )}

            {/* Жанры в виде интерактивных тегов */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Жанры</Text>
              <View style={styles.genresList}>
                {media.genres?.map((genre, index) => (
                  <TouchableOpacity key={index} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Первоисточник</Text>
              <Text style={styles.infoValue}>
                {media.source_name || 'Оригинал'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Статус</Text>
              <Text style={[styles.infoValue, { color: media.status === 'Вышел' ? '#ff4d4d' : '#4dff4d' }]}>
                {media.status || 'Вышел'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Год выпуска: </Text>
              <Text style={styles.infoValue}>{media.release_year}</Text>
            </View>

             <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Возрастной рейтинг</Text>
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{media.age_rating}</Text>
              </View>
            </View>

            {/* Длительность */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Длительность</Text>
              <Text style={styles.infoValue}>
                  {formatDuration(media.duration)}
                  {media.type === 'tv_series' ? ' ~ серия' : ''}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Студия</Text>
              <TouchableOpacity>
                  <Text style={[styles.infoValue, styles.linkText]}>{media.studio_name || 'Не указана'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Режиссёр</Text>
              <View style={styles.genresList}> 
                {directors.map((person, index) => (
                  <TouchableOpacity key={person.person_id || index} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{person.full_name}</Text>
                  </TouchableOpacity>
                ))}
                {directors.length === 0 && (
                  <Text style={styles.infoValue}>Не указан</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Главные герои</Text>
              <View style={styles.genresList}> 
                {MainActors.map((person, index) => (
                  <TouchableOpacity key={person.person_id || index} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{person.character_name} ({person.full_name})</Text>
                  </TouchableOpacity>
                ))}
                {MainActors.length === 0 && (
                  <Text style={styles.infoValue}>Не указан</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow} >
              <Text style={styles.infoKey}>Полный состав</Text>
              <TouchableOpacity onPress={() => router.push(`/MediaID/${id}/cast`)}>
                <Text style={styles.allCastLink}>Все {media.people?.length}</Text>
              </TouchableOpacity>
            </View>

          </View>   
        </View>

        {media.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            
            <Text 
              style={styles.description} 
              numberOfLines={isExpanded ? undefined : 3} // Ограничиваем строки
              ellipsizeMode="tail"
            >
              {media.description}
            </Text>

            <TouchableOpacity onPress={toggleExpanded} style={styles.moreButton}>
              <Text style={styles.moreButtonText}>
                {isExpanded ? 'Свернуть' : 'Показать полностью'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {mediaContent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Галерея и трейлеры</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.extraScrollContent}
            >
              {mediaContent.map((item, index) => (
                <View key={index} style={styles.extraItemContainer}>
                  {item.type_name === 'trailer' ? (
                    // Трейлер (Плеер)
                    <View style={styles.trailerWrapper}>
                      {renderExternalPlayer(item.url, 280)}
                    </View>
                  ) : (
                    // Скриншот
                    <TouchableOpacity activeOpacity={0.9}>
                      <Image 
                        source={{ uri: getPosterUrl(item.url) }} 
                        style={styles.screenshotItem}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>
            {media.type === 'tv_series' ? `Смотреть: ${selectedEpisode?.title}` : `Смотреть онлайн: ${displayTitle}`}
          </Text>
          
          {renderSourcePicker(videoSources, selectedSource, setSelectedSource, "Выберите плеер")}

          <View style={styles.playerCenteredWrapper}>
            {selectedSource ? (
              renderExternalPlayer(selectedSource.url)
            ) : (
              <View style={styles.playerPlaceholder}>
                <Text style={styles.noVideoText}>Плееры еще не добавлены</Text>
              </View>
            )}
          </View>
        </View >

        <View style={styles.commentFormSection}>
          <Text style={styles.sectionTitle}>
            {isEditing ? "Редактировать ваш отзыв" : "Оставить комментарий"}
          </Text>

          <TouchableOpacity 
            style={styles.spoilerContainer} 
            onPress={() => setIsSpoiler(!isSpoiler)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isSpoiler && styles.checkboxActive]}>
              {isSpoiler && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.spoilerText}>В комментарии есть спойлеры</Text>
          </TouchableOpacity>
  
          <TextInput
            style={styles.input}
            placeholder="Напишите ваше мнение..."
            placeholderTextColor="#777"
            multiline={true}             
            scrollEnabled={false}
            value={comment}
            onChangeText={setComment}
          />
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendComment}
          >
            <Text style={styles.sendButtonText}>
              {isEditing ? "Сохранить изменения" : "Отправить"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      
      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </View>
  );
  
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60, 
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  heroSection: {
    marginTop: Platform.OS === 'web' ? 70 : 100,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  poster: {
    width: 340,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    ...Platform.select({
      web: {
        marginRight: 20,
      },
      default: {
        marginRight: 0,
        marginBottom: 20,
      }
    })
  },
  heroContent: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoKey: {
    color: '#888', 
    fontSize: 15,
    width: 120, 
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  linkText: {
    color: '#ff4d4d', 
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreChipText: {
    color: '#ff4d4d',
    fontSize: 14,
  },
  ageBadge: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ageText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  Origtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rating: {
    fontSize: 16,
    color: '#ffd700',
  },
  type: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 24,
    color: '#ccc',
    lineHeight: 28,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingSeparator: {
    color: '#666',
    fontSize: 16,
  },
  videoSection: {
    width: '100%',
    padding: 20,
    borderTopWidth: 1,
    marginVertical: 20,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
  },
  //Для веба
  heroSectionWeb: {
    marginTop: 70,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  // Для мобильных 
  heroSectionMobile: {
    marginTop: 100,
    flexDirection: 'column',
    padding: 20,
    alignItems: 'center',
  },
  playerContainer: {
    width: '100%',
    maxWidth: 900, 
    backgroundColor: '#000',
    borderRadius: 16, // Мягкие углы
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playerPlaceholder: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },  
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerScroll: {
    gap: 10,
    paddingBottom: 5,
  },
  pickerBtn: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerBtnActive: {
    backgroundColor: '#e50914', 
    borderColor: '#e50914',
  },
  pickerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerCenteredWrapper: {
    width: VIDEO_WIDTH,       
    height: VIDEO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  allCastLink: {
    color: '#ff4d4d', 
    fontSize: 15,
    fontWeight: '500',
  },
  moreButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  moreButtonText: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 15, 
    marginTop: 10,
    flexWrap: 'wrap',
  },
  userRateBtn: {
    backgroundColor: '#0f0f0f', 
    flexDirection: 'row',       
    alignItems: 'center',       
    paddingHorizontal: 20,      
    paddingVertical: 12,        
    borderRadius: 8,            
    minWidth: 160,              
    elevation: 5,
  },
  userRateText: {
    color: '#e2d8d8',
    fontSize: 18,
    marginTop: 4,
  },
  starIcon: {
    fontSize: 40,               
    marginRight: 12,
  },
  rateTextContainer: {
    flexDirection: 'column',    
    justifyContent: 'center',
  },
  ratingWrapper: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', 
    zIndex: 100,
  },
  starsDropdown: {
    position: 'absolute',
    left: '100%', 
    flexDirection: 'row',
    backgroundColor: '#333', // Темный фон как на скрине
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    // Небольшая тень для объема
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  starTouch: {
    paddingHorizontal: 4,
  },
  starSmall: {
    fontSize: 26,
  },
  starYellow: {
    color: '#ffc107', 
  },
  starGray: {
    color: '#555',
  },
  extraSection: {
    borderTopWidth: 1,
    marginTop: 20,
    paddingLeft: 20, // Отступ заголовка
  },
  extraScrollContent: {
    paddingRight: 20, // Отступ после последнего элемента
    alignItems: 'center', // Центрирование по вертикали внутри строки
  },
  extraItemContainer: {
    marginRight: 12, // Расстояние между объектами
  },
  trailerWrapper: {
    width: 480, // Ширина окна трейлера в ленте
    height: 280, 
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  screenshotItem: {
    width: 380, // Ширина скриншота чуть меньше трейлера для акцента
    height: 280, // Высота должна совпадать с трейлером!
    borderRadius: 10,
    backgroundColor: '#222',
  },
  commentFormSection: {
    backgroundColor: '#555',
    borderTopWidth: 1,
    marginLeft: 20,
    marginEnd: 20,
    padding: 10,
    borderRadius: 15,           
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    minHeight: 100, 
    textAlignVertical: 'top', 
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  sendButton: {
    backgroundColor: '#E50914', 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '20%'
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  spoilerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E50914', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#E50914',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  spoilerText: {
    color: '#ccc',
    fontSize: 16,
  },
});
