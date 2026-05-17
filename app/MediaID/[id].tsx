import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform, ScrollView, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import WebView from 'react-native-webview';
import Header from '../../src/components/Header';
import WebPlayer from '../../src/components/pleer';
import SideMenu from '../../src/components/SideMenu';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useMediaById } from '../../src/hooks/useMedia';
import { commentAPI, listAPI, userAPI } from '../../src/services/api';
import { CONFIG } from '../../src/services/constants';
import { MediaComment } from '../../types/media.types';


export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { media, loading } = useMediaById(id as string);
  const { user, isAuth, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const userId = user?.user_id;
  const SERVER_URL = CONFIG.SERVER_URL;

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  //Отслеживания состония кнопки "Показать полностью"
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedRating, setSelectedRating] = useState(media?.user_rating || 0);
  const [isHovering, setIsHovering] = useState(false);
  const [comment, setComment] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [userCommentId, setUserCommentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [statuses, setStatuses] = useState<{statuses_id: number, name: string}[]>([]);
  const [currentStatus, setCurrentStatus] = useState<number | null>(null);
  const [currentStatusName, setCurrentStatusName] = useState<string | null>(null);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number>(1); // Номер текущей серии
  const [selectedSource, setSelectedSource] = useState<any>(null); // Активный плеер

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await listAPI.getStatuses(); 
        setStatuses(data);
      } catch (error) {
        console.error("Ошибка загрузки статусов:", error);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (media) {
      //Синхронизируем рейтинг пользователя
      if (media.user_rating !== undefined) {
        setSelectedRating(media.user_rating);
      }

      setCurrentStatus(media.user_list_id || null);
      setCurrentStatusName(media.user_list_name || "Добавить в список");

      fetchComments(id)

      // ЕСЛИ ЭТО СЕРИАЛ: Автоматически выбираем самую первую серию первого сезона при загрузке
      if (media.type === 'tv_series' && media.video && media.video.length > 0) {
        const episodesOnly = media.video?.filter((s: any) => s.type_name === 'episode') || [];
        
        if (episodesOnly.length > 0 && !selectedEpisodeNumber) {
          setSelectedEpisodeNumber(1);
        }
      }
    }
  }, [media]); 

  useEffect(() => {
    if (media && media.video) {
      let videoSources = [];

      if (media.type === 'tv_series') {
        // Ищем все плееры, используя РЕАЛЬНОЕ поле episode_number, которое теперь прилетает с бэка!
        videoSources = media.video.filter(
          (s: any) => s.type_name === 'episode' && s.episode_number === selectedEpisodeNumber
        );
      } else {
        // Для фильмов отсекаем трейлеры и берем только полноценные плееры (movie или full)
        videoSources = media.video.filter(
          (s: any) => s.type_name === 'movie'  || s.type_name !== 'trailer'
        );
      }

      // Устанавливаем выбранный плеер
      if (videoSources.length > 0) {
        // Если текущий выбранный плеер не подходит под эту серию/фильм, ставим первый доступный
        const isCurrentSourceValid = videoSources.some((s: any) => s.url === selectedSource?.url);
        if (!isCurrentSourceValid) {
          setSelectedSource(videoSources[0]);
        }
      } else {
        setSelectedSource(null);
      }
    }
  }, [media, selectedEpisodeNumber]);

  const handleMenuPress = () => {
    setIsMenuVisible(true); 
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false); 
  };

  const handleStatusChange = async (statusId: number | string) => {
    const finalStatusId = (statusId === 'clear') ? null : Number(statusId);

    setCurrentStatus(finalStatusId);
    setIsOpen(false);

    if (statusId === 'clear' || statusId === null) {
      try {
        setCurrentStatus(null);
        await listAPI.updateUserList(Number(id), null);
        return; // Выходим из функции
      } catch (e) {
        alert("Ошибка при удалении");
        return;
      }
    }

    // Логика для обычных ID (чисел)
    try {
      const numericId = Number(statusId);
      setCurrentStatus(numericId);
      await listAPI.updateUserList(Number(id), numericId);
    } catch (e) {
      alert("Ошибка при сохранении");
    }
  };

  const statusConfig: { [key: number]: { icon: any, color: string } } = {
    1: { icon: 'play-circle-outline', color: '#4dff4d' }, // Смотрю
    2: { icon: 'check-circle', color: '#4db8ff' },        // Просмотрено
    3: { icon: 'pause-circle-filled', color: '#ffc107' }, // Отложено
    4: { icon: 'highlight-off', color: '#ff4d4d' },       // Брошено
    5: { icon: 'schedule', color: '#ccc' },              // Запланировано
    6: { icon: 'replay', color: '#a34dff' },              // Пересматриваю
  };


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


  // Фильтруем трейлеры и кадры
  const mediaContent = [
    ...(media.extras?.filter(item => item.type_name === 'trailer') || []),
    ...(media.extras?.filter(item => item.type_name === 'screenshot') || [])
  ];

  const renderExternalPlayer = (url: string | null) => {
    if (!url) {
      return (
        <View style={styles.playerPlaceholder}>
          <Text style={styles.noVideoText}>Видео временно недоступно</Text>
        </View>
      );
    }

    return (

      <View style={{ width: '100%', height: '100%' }}>
        {Platform.OS === 'web' ? (
          
          <WebPlayer url={`${url}?behavior=fit&padding=false`} />
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

    } catch (error) {
      //Откат, если что-то пошло не так
      setSelectedRating(previousRating);
      console.error("Ошибка при сохранении оценки:", error);
      alert("Не удалось сохранить оценку. Проверьте соединение.");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return theme.text ; 
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

  const dropdownData = [
    ...statuses,
    { statuses_id: 'clear', name: 'Удалить из списка', isClearButton: true }
  ];

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
          <View style={styles.leftColumn}>
            <Image 
              source={{ uri: getPosterUrl(media.poster_url) }} 
              style={styles.poster}
            />

            <View style={styles.statusContainer}>
              <TouchableOpacity 
                  style={styles.statusDropdownButton}
                  onPress={() => setIsOpen(!isOpen)} // Просто переключаем видимость
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {/* Иконка на кнопке */}
                    <MaterialIcons 
                      name={currentStatus ? statusConfig[currentStatus as number]?.icon : 'add-circle-outline'} 
                      size={22} 
                      color={currentStatus ? statusConfig[currentStatus as number]?.color : '#aaa'} 
                      style={{ marginRight: 10 }} 
                    />
                  <Text style={styles.statusDropdownText}>
                    {currentStatus 
                      ? (statuses.find(s => s.statuses_id === currentStatus)?.name || "Выбрать статус")
                      : "Добавить в список"
                    }
                  </Text>
                </View>
                <Text style={styles.dropdownArrow}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.dropdownListContainer}>
                  <FlatList
                    data={dropdownData}
                    keyExtractor={(item) => item.statuses_id.toString()}
                    renderItem={({ item }) => {
                      const isClearAction = 'isClearButton' in item && item.isClearButton;
                      

                      return (
                        <TouchableOpacity 
                          style={styles.dropdownItem} 
                          onPress={() => {
                            handleStatusChange(item.statuses_id);
                            setIsOpen(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText, 
                            isClearAction && { color: '#ff4d4d', fontWeight: 'bold' } // Красный цвет
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                    // Чтобы список не прокручивал всю страницу на вебе
                    scrollEnabled={true}
                  />
                </View>
              )}
            </View>
          </View>

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
                <Text style={styles.infoKey}>Cезонов </Text>
                <Text style={styles.infoValue}>{media.seasons.length}</Text>
              </View>
            )} 

            {media.type === 'tv_series' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Серий в сезоне </Text>
                <Text style={styles.infoValue}>{media.episode_count || 'N/A'}</Text>
              </View>
            )}

            {/* Жанры в виде интерактивных тегов */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Жанры</Text>
              <View style={styles.genresList}>
                {media.genres?.map((genre: any, index: number) => (
                  <TouchableOpacity key={index} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{genre.name}</Text>
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
                      {renderExternalPlayer(item.url)}
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

        {/* --- СЕКЦИЯ ВИДЕОПЛЕЕРА --- */}
        <View style={styles.mainPlayerRow}>
          
          {/* ЛЕВАЯ ЧАСТЬ: Сам плеер и заголовок */}
          <View style={styles.leftPlayerColumn}>
            <Text style={styles.sectionTitle}>
              {media.type === 'tv_series' 
                ? `Смотреть: Серия ${selectedEpisodeNumber}` 
                : `Смотреть онлайн: ${media.main_title}`}
            </Text>

            {/* ДОБАВЛЯЕМ ИНФОРМАЦИЮ О СЕРИИ ИЛИ ФИЛЬМЕ */}
            {media.video && (() => {
              // Находим нужный объект в зависимости от типа
              const currentMediaData = media.type === 'tv_series'
                ? media.video.find((v: any) => v.type_name === 'episode' && v.episode_number === selectedEpisodeNumber) as any
                : media.video.find((v: any) => v.type_name === 'movie' || v.type_name === 'full') as any;

              // Если данных нет, просто не выводим текстовые метаданные, но плеер не блокируем
              if (!currentMediaData) return null;

              // Для сериалов выводим название серии и дату
              if (media.type === 'tv_series') {
                return (
                  <View style={styles.episodeMetaContainer}>
                    {currentMediaData.title && (
                      <Text style={styles.episodeTitleText}>«{currentMediaData.title}»</Text>
                    )}
                    {currentMediaData.release_date && (
                      <Text style={styles.episodeDateText}>
                        Премьера: {new Date(currentMediaData.release_date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                );
              }

              // Для фильмов (все ситуации, когда это не tv_series)
              if (currentMediaData.release_date) {
                return (
                  <View style={styles.episodeMetaContainer}>
                    <Text style={styles.episodeDateText}>
                      Премьера в мире: {new Date(currentMediaData.release_date).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                );
              }

              return null;
            })()}
            
            {/* Сам контейнер с плеером */}
            <View style={styles.playerCenteredWrapper}>
              {selectedSource ? (
                renderExternalPlayer(selectedSource.url)
              ) : (
                <View style={styles.playerPlaceholder}>
                  <Text style={styles.noVideoText}>Видео временно недоступно</Text>
                </View>
              )}
            </View>
          </View>

          {/* ПРАВАЯ ЧАСТЬ: Выбор доступных плееров*/}
          <View style={styles.rightSidebarColumn}>
            <Text style={styles.sidebarTitle}>Доступные плееры:</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
              {media.video && media.video
                .filter((source: any) => {
                  // Показываем плеер, только если его номер серии совпадает со взятым на фронте
                  return source.type_name === 'episode' && source.episode_number === selectedEpisodeNumber;
                })
                .map((source: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sidebarPlayerBtn,
                      selectedSource?.url === source.url && styles.sidebarPlayerBtnActive
                    ]}
                    onPress={() => setSelectedSource(source)}
                  >
                    <Text style={[
                      styles.sidebarPlayerBtnText,
                      selectedSource?.url === source.url && styles.sidebarPlayerBtnTextActive
                    ]}>
                      {source.player_name?.toUpperCase() || `Плеер ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

        </View>

        {/* НИЖНЯЯ ЧАСТЬ: Выбор серий */}
        {media.type === 'tv_series' && media.video && (
          <View style={styles.bottomEpisodesContainer}>
            <Text style={styles.episodesTitle}>Выберите серию:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodesScroll}>
              {(() => {
                // Достаем номера серий. Если e.episode_number нет, временно ставим 1
                const allEpisodeNumbers = media.video
                  .filter((s: any) => s.type_name === 'episode')
                  .map((s: any) => s.episode_number); 

                // Оставляем только уникальные: [1, 2]
                const uniqueEpisodes = Array.from(new Set(allEpisodeNumbers)).sort((a: any, b: any) => a - b);

                return uniqueEpisodes.map((episodeNum: any) => (
                  <TouchableOpacity
                    key={episodeNum}
                    style={[
                      styles.episodeButton,
                      selectedEpisodeNumber === episodeNum && styles.activeEpisodeButton
                    ]}
                    onPress={() => setSelectedEpisodeNumber(episodeNum)}
                  >
                    <Text style={[
                      styles.episodeButtonText,
                      selectedEpisodeNumber === episodeNum && styles.activeEpisodeButtonText
                    ]}>
                      {episodeNum}
                    </Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          </View>
        )}

        
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

const getStyles = (theme: any) => StyleSheet.create({
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.buttonBackground,
    backgroundColor: theme.buttonBackground,
    
  },
  dropdownItemText: {
    color: theme.textButton,
    fontSize: 16,
  },
  dropdownMenu: {
    width: 250,
    backgroundColor: '#222', // Оставляем темным само меню
    borderRadius: 8,
    // Добавь тень, чтобы меню выделялось на фоне без затемнения
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#444', // Легкая рамка для четкости
  },
  scrollContent: {
    paddingBottom: 60, 
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.text,
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
    }),
    marginBottom: 10,
  },
  heroContent: {
    flex: 1,
    gap: 12,
    zIndex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoKey: {
    color: theme.textSecondary, 
    fontSize: 15,
    width: 120, 
  },
  infoValue: {
    color: theme.text,
    fontSize: 15,
    flex: 1,
  },
  linkText: {
    color: theme.accent, 
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  genreChip: {
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreChipText: {
    color: theme.accent,
    fontSize: 14,
  },
  ageBadge: {
    borderWidth: 1,
    borderColor: theme.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ageText: {
    color: theme.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.text,
  },
  Origtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  rating: {
    fontSize: 16,
    color: theme.star,
  },
  type: {
    fontSize: 14,
    color: theme.text,
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
    color: theme.text,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 24,
    color:  theme.text,
    lineHeight: 28,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingSeparator: {
    color: theme.textSecondary,
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
    color: theme.textSecondary,
    fontSize: 16,
  },
  //Для веба
  heroSectionWeb: {
    marginTop: 70,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
    zIndex: 1000,
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
    backgroundColor: theme.background,
    borderRadius: 16, // Мягкие углы
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playerPlaceholder: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: theme.background,
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
    color: theme.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerScroll: {
    gap: 10,
    paddingBottom: 5,
  },
  pickerBtn: {
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pickerBtnActive: {
    backgroundColor: theme.accent, 
    borderColor: theme.accent,
  },
  pickerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  allCastLink: {
    color: theme.accent, 
    fontSize: 15,
    fontWeight: '500',
  },
  moreButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  moreButtonText: {
    color: theme.accent,
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
    backgroundColor: theme.backgroundSecondary,
    flexDirection: 'row',       
    alignItems: 'center',       
    paddingHorizontal: 20,      
    paddingVertical: 12,        
    borderRadius: 8,            
    minWidth: 160,              
    elevation: 5,
  },
  userRateText: {
    color: theme.text,
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
    backgroundColor: theme.background, // Темный фон как на скрине
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    // Небольшая тень для объема
    shadowColor: theme.shadow,
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
    color: theme.star,
  },
  starGray: {
    color: theme.textSecondary,
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
    backgroundColor: theme.backgroundSecondary,
    borderTopWidth: 1,
    marginLeft: 20,
    marginEnd: 20,
    padding: 10,
    borderRadius: 15,           
    overflow: 'hidden',
  },
  input: {
    backgroundColor: theme.input,
    color: theme.text,
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
    backgroundColor: theme.accent,
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
    borderColor: theme.accent, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: theme.accent,
  },
  checkmark: {
    color: theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  spoilerText: {
    color: '#ccc',
    fontSize: 16,
  },
  // Контейнер для всей секции списков
  statusContainer: {
    zIndex: 200,
    width: '100%',
    paddingHorizontal: 0,
    marginVertical: 0,
    backgroundColor: 'transparent', // Сам контейнер прозрачный
    overflow: 'visible',
  },
  // Контейнер прокрутки кнопок
  statusList: {
    flexDirection: 'row',
  },
  // Базовый стиль кнопки
  statusButton: {
    backgroundColor: '#2a2a2a', // Темно-серый фон для неактивных
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Овальная форма
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Стиль для выбранной кнопки
  statusButtonActive: {
    backgroundColor: '#e50914', // Красный акцент (как у Netflix)
    borderColor: '#e50914',
    // Тень для эффекта свечения (только iOS)
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    // Тень для Android
    elevation: 5,
  },
  // Базовый текст кнопки
  statusText: {
    color: '#bbbbbb',
    fontSize: 14,
    fontWeight: '500',
  },
  // Текст в активной кнопке
  statusTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  posterWrapper: {
    alignItems: 'center',
    width: 340, // Должно совпадать с шириной постера
    marginRight: Platform.OS === 'web' ? 20 : 0,
    zIndex: 1000, // Очень важно для того, чтобы список был поверх всего
    position: 'relative',
  },
  dropdownListContainer: {
    position: 'absolute',
    top: '100%', // Начинается сразу под кнопкой
    left: 0,
    right: 0,
    backgroundColor: theme.buttonBackground, // Темный фон как на image_e01ef8.jpg
    borderRadius: 4,
    marginTop: 4, // Небольшой зазор
    maxHeight: 250, // Чтобы список не ушел за пределы экрана
    overflow: 'hidden', // Чтобы углы FlatList не вылезали за borderRadius
    zIndex: 9999,
    
    // Тени, чтобы список "парил" над контентом
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#444',
  },
  statusDropdownButton: {
    backgroundColor: theme.buttonBackground, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 4,
    width: '100%',
  },
  statusDropdownText: {
    color: theme.textButton,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: {
    color: theme.textButton,
    fontSize: 12,
  },
  leftColumn: {
    width: 340, // Ширина должна быть как у постера
    alignItems: 'flex-start',
    // На вебе даем отступ справа, чтобы текст не прилипал
    marginRight: Platform.OS === 'web' ? 25 : 0, 
    zIndex: 100,
  },
  episodesContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  activeEpisodeButton: {
    backgroundColor: '#ff4d4d', // Выделяем активную серию фирменным красным
    borderColor: '#ff4d4d',
  },
  episodeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeEpisodeButtonText: {
    color: '#ffffff', // Текст остается белым, но на красном фоне
  },
  sidebarScroll: {
    gap: 8, // Отступы между кнопками в сайдбаре
  },
  sidebarPlayerBtn: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#262626',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  sidebarPlayerBtnActive: {
    backgroundColor: '#ff4d4d', // Выделение активного плеера как на референсе
    borderColor: '#ff4d4d',
  },
  sidebarPlayerBtnText: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  sidebarPlayerBtnTextActive: {
    color: '#fff',
  },
  mainPlayerRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
    gap: 15,
  },
  leftPlayerColumn: {
    flex: 3, // Занимает 75% ширины
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rightSidebarColumn: {
    flex: 1, // Занимает 25% ширины
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#262626',
    
    // Заставляем сайдбар принять ТОЧНО ТАКУЮ ЖЕ высоту, как левый плеер + его заголовок
    alignSelf: 'stretch',
  },
  
  // Убедись, что WebView или iframe занимают всю высоту
  playerCenteredWrapper: {
    
    // ДОБАВЬ ЭТИ ДВЕ СТРОЧКИ:
    aspectRatio: 16 / 9, // Жестко задает пропорцию стандартного плеера 16:9
    width: '100%',       // Растягивается во всю ширину колонки
    
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
 
  sidebarTitle: {
    color: '#888', // Сделали чуть темнее
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15, // Уменьшили отступ
  },
  bottomEpisodesContainer: {
    width: '100%',
    paddingHorizontal: 15,
    
    // ЭТО ПРИБЛИЖАЕТ СЕРИИ:
    marginTop: -5, // Отрицательный marginTop, чтобы они "подтянулись" к плееру
    marginBottom: 20,
  },
  episodesTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8, // Уменьшили отступ
  },
  episodesScroll: {
    paddingVertical: 5,
  },
  episodeButton: {
    width: 50,
    height: 45, // Сделали чуть аккуратнее
    backgroundColor: '#222',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  episodeMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 10,
    gap: 12, // Отступ между названием и функцией даты
  },
  episodeTitleText: {
    fontSize: 16,
    fontWeight: '600',
    // Цвет подстроится под тему: берем посветлее/заметный
    color: theme.text, 
  },
  episodeDateText: {
    fontSize: 14,
    // Делаем дату приглушенной (серой), чтобы она не перетягивала внимание
    color: '#888888', 
  },
});
