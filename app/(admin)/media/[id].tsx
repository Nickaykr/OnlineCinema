import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { adminApi } from '../../../src/services/adminAPI';
import { CONFIG } from '../../../src/services/constants';
import { showNotification } from '../../../src/utils/notifications';
import { MediaRelease } from '../../../types/media.types';

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [data, setData] = React.useState<MediaRelease | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editData, setEditData] = React.useState<any>(null);
  const [activeField, setActiveField] = React.useState<string | null>(null);
  const [allGenres, setAllGenres] = React.useState<{genre_id: number, name: string}[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = React.useState<number[]>([]);
  const initialGenreIds = data?.genres?.map((g: any) => g.genre_id).sort().join(',') || '';
  const currentGenreIds = selectedGenreIds.sort().join(',');
  const [allPeople, setAllPeople] = React.useState<any[]>([]); // Все из БД
  const [allRoles, setAllRoles] = React.useState<any[]>([]);   // Все роли из БД
  const [selectedPeople, setSelectedPeople] = React.useState<any[]>([]); // Текущая команда
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPersonForRole, setSelectedPersonForRole] = React.useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(null);

  const SERVER_URL = CONFIG.SERVER_URL;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getMediaById(Number(id));
        setData(response);
        setEditData(response);
      } catch (error) {
        showNotification("Ошибка загрузки данных", "error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
    const fetchAllGenres = async () => {
        try {
        const genres = await adminApi.getAllGenres();
            setAllGenres(genres);
        } catch (e) {
            console.error("Ошибка загрузки списка жанров");
        }
    };
    fetchAllGenres();
    const fetchAllPeople = async () => {
        try {
            const people = await adminApi.getAllPeople();
            setAllPeople(people);
        } catch (e) {
            console.error("Ошибка загрузки списка людей");
        }
    };
    fetchAllPeople();
    const fetchRoles = async () => {
    try {
        const roles = await adminApi.getAllRoles();
        setAllRoles(roles);
    } catch (e) {
        console.error("Ошибка загрузки ролей");
    }
    };
    fetchRoles();
  }, [id]);

  // Синхронизируем выбранные жанры, когда приходят данные о медиа
  useEffect(() => {
    if (data?.genres && Array.isArray(data.genres)) {
        // Вытягиваем ID из объектов [{genre_id: 1, name: 'Драма'}, ...]
        const ids = data.genres
        .filter((g: any) => g && g.genre_id) 
        .map((g: any) => g.genre_id);
        setSelectedGenreIds(ids);
    }
    if (data?.people && Array.isArray(data.people)) {
        // Мапим данные из твоего SQL запроса в формат стейта
        const currentTeam = data.people.map((p: any) => ({
        person_id: p.person_id,
        role_id: p.role_id,
        full_name: p.full_name,
        role_name: p.role_name,
        character_name: p.character_name || ''
        }));
        setSelectedPeople(currentTeam);
    }
  }, [data]);

  // Функция для добавления/удаления жанра из списка правок
  const toggleGenre = (genreId: number) => {
    setSelectedGenreIds(prev => 
        prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  const removePerson = (index: number) => {
    setSelectedPeople(selectedPeople.filter((_, i) => i !== index));
  };

  const confirmAddPerson = () => {
    if (!selectedPersonForRole || !selectedRoleId) return;

    const role = allRoles.find(r => r.role_id === selectedRoleId);
    
    const newMember = {
        person_id: selectedPersonForRole.person_id,
        role_id: selectedRoleId,
        full_name: selectedPersonForRole.full_name,
        role_name: role?.name || 'Актер',
        character_name: '' // Пустое по умолчанию
    };

    setSelectedPeople([...selectedPeople, newMember]);
    
    // Сброс состояния модалки
    setModalVisible(false);
    setSelectedPersonForRole(null);
    setSelectedRoleId(null);
    setSearchQuery('');
  };

  const handleReset = () => {
    if (!data) return;

    // 1. Сбрасываем текстовые поля и основные данные
    setEditData(data);

    // 2. Сбрасываем жанры
    const originalGenreIds = data.genres
        ? data.genres.filter((g: any) => g && g.genre_id).map((g: any) => g.genre_id)
        : [];
    setSelectedGenreIds(originalGenreIds);

    // 3. Сбрасываем команду (актеров)
    const originalTeam = data.people 
        ? data.people.map((p: any) => ({
            person_id: p.person_id,
            role_id: p.role_id,
            full_name: p.full_name,
            role_name: p.role_name,
            character_name: p.character_name || ''
        }))
        : [];
    setSelectedPeople(originalTeam);

    // 4. Закрываем активные поля ввода
    setActiveField(null);
    
    showNotification("Изменения сброшены", "info");
  };

  // Сравнение данных для активации кнопки
  const isChanged = 
    JSON.stringify({ ...data, genres: undefined }) !== JSON.stringify({ ...editData, genres: undefined }) || 
    initialGenreIds !== currentGenreIds;

  const handleSave = async () => {
    if (!editData || !data) return;

    const payload = {
      ...editData,
      media_id: data.media_id,
      genres: selectedGenreIds,
      release_year: parseInt(String(editData.release_year)),
      duration: parseInt(String(editData.duration)),
      episode_count: parseInt(String(editData.episode_count))
    };

    try {
      await adminApi.updateMedia(Number(id), payload);
      showNotification("Данные обновлены", "success");
      const updatedGenres = allGenres.filter(g => selectedGenreIds.includes(g.genre_id));
      setData({ ...editData, genres: updatedGenres }); 
    } catch (error) {
      showNotification("Ошибка при сохранении", "error");
    }
  };

  const getPosterUrl = (posterPath: string | null): string => {
    if (!posterPath) return 'https://via.placeholder.com/150';
    if (posterPath.startsWith('http')) return posterPath;
    return `${SERVER_URL}/${posterPath.replace(/^\//, '')}`;
  };

  const handleOpenPlayer = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      showNotification("Некорректная ссылка", "error");
    }
  };

  // Компонент для полей в сетке (Год, Длительность и т.д.)
  const InfoItem = ({ label, fieldKey, value }: { label: string, fieldKey: string, value: any }) => {
    const isEditing = activeField === fieldKey;
    return (
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.gridInput}
            value={String(editData?.[fieldKey] || '')}
            onChangeText={(text) => setEditData({ ...editData, [fieldKey]: text })}
            autoFocus
            keyboardType="numeric"
            onBlur={() => setActiveField(null)}
          />
        ) : (
          <TouchableOpacity onPress={() => setActiveField(fieldKey)} style={styles.inlineRow}>
            <Text style={styles.infoValue}>{value || '—'}</Text>
            <MaterialIcons name="edit" size={12} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Компонент для больших полей (Название, Описание)
  const EditableField = ({ label, fieldKey, value, multiline = false }: any) => {
    const isEditing = activeField === fieldKey;
    return (
      <View style={styles.fieldWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.inputRow}>
          {isEditing ? (
            <TextInput
              style={[styles.inlineInput, multiline && { minHeight: 80 }]}
              value={String(editData?.[fieldKey] || '')}
              onChangeText={(text) => setEditData({ ...editData, [fieldKey]: text })}
              autoFocus
              multiline={multiline}
              onBlur={() => setActiveField(null)}
            />
          ) : (
            <TouchableOpacity onPress={() => setActiveField(fieldKey)} style={styles.textContainer}>
              <Text style={[styles.infoValue, fieldKey === 'main_title' && styles.titleText]}>
                {value || '—'}
              </Text>
              <MaterialIcons name="edit" size={18} color={theme.text} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} color={theme.primary} />;

  return (
    <ScrollView style={styles.container}>
      {data && editData && (
        <>
          <View style={styles.header}>
            <Image 
              source={{ uri: getPosterUrl(data.poster_url) }} 
              style={styles.poster} 
              resizeMode="cover"
            />
            <View style={styles.mainInfo}>
              <EditableField label="Название (RU)" fieldKey="main_title" value={editData.main_title} />
              <EditableField label="Оригинал" fieldKey="original_title" value={editData.original_title} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <InfoItem label="Год" fieldKey="release_year" value={editData.release_year} />
            <InfoItem label="Мин." fieldKey="duration" value={editData.duration} />
            <InfoItem label="Возраст" fieldKey="age_rating" value={editData.age_rating} />
            <InfoItem label="Серий" fieldKey="episode_count" value={editData.episode_count} />
            <InfoItem label="Статус" fieldKey="status_name" value={data.status} />
            <InfoItem label="Студия" fieldKey="studio_name" value={data.studio_name} />
          </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Жанры</Text>
                
                {/* Кнопка с галочкой или карандашом */}
                <TouchableOpacity
                onPress={() => setActiveField(activeField === 'genres' ? null : 'genres')}
                style={[
                    styles.editButton, 
                    activeField === 'genres' && styles.editButtonActive // Красная обводка в режиме редактирования
                ]}
                >
                <MaterialIcons
                    name={activeField === 'genres' ? "check" : "edit"}
                    size={22}
                    // Иконка: Красная в режиме редактирования, Тема (Белая/Золотистая) в режиме просмотра
                    color={activeField === 'genres' ? "#FF3B30" : theme.text} 
                />
                </TouchableOpacity>
            </View>

            <View style={styles.genreRow}>
                {activeField === 'genres' ? (
                // --- РЕЖИМ РЕДАКТИРОВАНИЯ ---
                allGenres.map((genre) => {
                    const isSelected = selectedGenreIds.includes(genre.genre_id);
                    return (
                    <TouchableOpacity
                        key={`edit-genre-${genre.genre_id}`}
                        onPress={() => toggleGenre(genre.genre_id)}
                        style={[
                        styles.genreBadge,
                        // Если выбран — Красный фон и Красная обводка
                        isSelected && styles.genreBadgeSelected 
                        ]}
                    >
                        <Text style={[
                        styles.genreText, 
                        // Если выбран — Белый текст на Красном фоне (для контраста)
                        isSelected && styles.genreTextSelected 
                        ]}>
                        {genre.name}
                        </Text>
                    </TouchableOpacity>
                    );
                })
                ) : (
                // --- РЕЖИМ ПРОСМОТРА ---
                data.genres?.map((g: any, index: number) => (
                    <View key={`view-genre-${g.genre_id || index}`} style={styles.genreBadge}>
                    <Text style={styles.genreText}>{g.name || g}</Text>
                    </View>
                ))
                )}
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Команда и Актеры</Text>
                <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => {
                        setSearchQuery(''); // Очищаем поиск перед открытием
                        setModalVisible(true); // Показываем модалку
                    }}
                    >
                <MaterialIcons name="person-add" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            {selectedPeople.map((p, index) => (
                <View key={index} style={styles.personCard}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{p.full_name}</Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{p.role_name}</Text>
                    
                    {/* Поле для ввода имени персонажа, если это актер (например, role_id === 1) */}
                    {p.role_id === 2 && (
                    <TextInput
                        style={styles.characterInput}
                        placeholder="Имя персонажа..."
                        placeholderTextColor="#666"
                        value={p.character_name}
                        onChangeText={(text) => {
                        const newList = [...selectedPeople];
                        newList[index].character_name = text;
                        setSelectedPeople(newList);
                        }}
                    />
                    )}
                </View>
                
                <TouchableOpacity onPress={() => removePerson(index)}>
                    <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                </View>
            ))}
            </View>

          <View style={styles.section}>
            <EditableField label="Описание" fieldKey="description" value={editData.description} multiline />
          </View>

          {/* Секция Плееров */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Проверка плееров</Text>
            <View style={styles.playerGrid}>
              {data.video?.map((v, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.playerButton, { backgroundColor: theme.card }]}
                  onPress={() => handleOpenPlayer(v.url)}
                >
                  <Text style={{ color: theme.text }}>{v.player_name || 'Источник'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            {/* Кнопка СБРОСА (видна только если есть изменения) */}
            {isChanged && (
                <TouchableOpacity 
                style={[styles.actionButton, styles.resetButton]} 
                onPress={handleReset}
                >
                <MaterialIcons name="restore" size={20} color="#fff" />
                <Text style={styles.saveButtonText}> СБРОСИТЬ</Text>
                </TouchableOpacity>
            )}

            {/* Кнопка СОХРАНЕНИЯ */}
            <TouchableOpacity 
                disabled={!isChanged}
                style={[
                styles.actionButton, 
                styles.saveFloatingButton, 
                { backgroundColor: isChanged ? '#4CAF50' : '#333', flex: isChanged ? 2 : 1 }
                ]}
                onPress={handleSave}
            >
                <Text style={styles.saveButtonText}>
                {isChanged ? "СОХРАНИТЬ ИЗМЕНЕНИЯ" : "ИЗМЕНЕНИЙ НЕТ"}
                </Text>
            </TouchableOpacity>
            </View>
        </>
      )}
      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            
            {!selectedPersonForRole ? (
                // --- ШАГ 1: ПОИСК ЧЕЛОВЕКА ---
                <>
                <Text style={styles.modalTitle}>Выбрать человека</Text>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Введите имя..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={allPeople.filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    keyExtractor={(item) => item.person_id.toString()}
                    renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.searchResultItem}
                        onPress={() => setSelectedPersonForRole(item)}
                    >
                        <Text style={{ color: '#fff' }}>{item.full_name}</Text>
                    </TouchableOpacity>
                    )}
                    style={{ maxHeight: 300 }}
                />
                </>
            ) : (
                <>
                <Text style={styles.modalTitle}>Роль для {selectedPersonForRole.full_name}</Text>
                <View style={styles.roleGrid}>
                    {allRoles.map((role) => (
                    <TouchableOpacity
                        key={role.role_id}
                        style={[
                        styles.roleBadge,
                        selectedRoleId === role.role_id && styles.roleBadgeSelected
                        ]}
                        onPress={() => setSelectedRoleId(role.role_id)}
                    >
                        <Text style={[
                        styles.roleText,
                        selectedRoleId === role.role_id && styles.roleTextSelected
                        ]}>
                        {role.name}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
                
                <TouchableOpacity 
                    style={[styles.confirmButton, !selectedRoleId && { opacity: 0.5 }]}
                    onPress={confirmAddPerson}
                    disabled={!selectedRoleId}
                >
                    <Text style={styles.confirmButtonText}>ДОБАВИТЬ В КОМАНДУ</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedPersonForRole(null)}>
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 15 }}>Назад к поиску</Text>
                </TouchableOpacity>
                </>
            )}

            <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                setModalVisible(false);
                setSelectedPersonForRole(null);
                }}
            >
                <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>ОТМЕНА</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </ScrollView>
  );
}

// Стили дополнены для работы сетки
const createStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.background 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    padding: 20, 
    paddingTop: 40 
  },
  poster: { 
    width: 110, 
    height: 160, 
    borderRadius: 12 
  },
  mainInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  fieldWrapper: { 
    marginBottom: 15 
  },
  infoLabel: { 
    fontSize: 12, 
    color: '#888', // Подпись оставляем серой для контраста
    marginBottom: 2 
  },
  infoValue: { 
    fontSize: 14, 
    color: theme.text 
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  textContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  inlineInput: { 
    flex: 1, 
    color: theme.text, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.primary, 
    paddingVertical: 5 
  },
  multilineInput: { 
    minHeight: 80 
  },
  editIconMargin: { 
    marginLeft: 10 
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    backgroundColor: theme.card, 
    margin: 15, 
    borderRadius: 12, 
    padding: 10 
  },
  infoItem: { 
    width: '33%', 
    padding: 10, 
    alignItems: 'center' 
  },
  inlineRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  gridInput: { 
    color: theme.text, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 2, 
    borderRadius: 4, 
    width: '100%', 
    textAlign: 'center' 
  },
  titleText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: theme.text 
  },
  section: { 
    paddingHorizontal: 20, 
    marginBottom: 20, 
    width: '100%' 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    color: theme.text, 
    fontWeight: 'bold' 
  },
  editButton: { 
    padding: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    minWidth: 44, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  editButtonActive: {
    borderColor: '#FF3B30', // Красный акцент для активной кнопки
    backgroundColor: 'rgba(255, 60, 48, 0.1)',
  },
  genreRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 10 
  },
  genreBadge: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    marginBottom: 4 
  },
  genreBadgeSelected: {
    backgroundColor: '#FF3B30', // Твой запрос: красный для выбранных
    borderColor: '#FF3B30',
  },
  genreText: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: theme.text 
  },
  genreTextSelected: { 
    color: '#FFFFFF', // Белый текст на красном фоне
    fontWeight: 'bold' 
  },
  playerGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  playerButton: { 
    padding: 12, 
    borderRadius: 8, 
    minWidth: '45%', 
    alignItems: 'center' 
  },
  saveFloatingButton: { 
    margin: 20, 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 40 
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  characterInput: {
    color: '#FF3B30', // Красный акцент, как ты просил для активных элементов
    fontSize: 13,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 60, 48, 0.3)',
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 15,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    searchResultItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    roleGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginVertical: 15,
},
roleBadge: {
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.05)',
},
roleBadgeSelected: {
  backgroundColor: '#FF3B30',
  borderColor: '#FF3B30',
},
roleText: {
  color: theme.text,
  fontSize: 14,
},
roleTextSelected: {
  color: '#fff',
  fontWeight: 'bold',
},
confirmButton: {
  backgroundColor: '#4CAF50',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
},
confirmButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
actionButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 10,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  resetButton: {
    backgroundColor: '#666', // Нейтральный серый для сброса
    flex: 1,
  },
});