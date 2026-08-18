import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';


export default function CreateMediaSeason() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Основной стейт формы
  const [form, setForm] = useState({
    media_id: '',          // Выбранная франшиза
    season_number: '',     // Номер сезона
    title: '',             // Название сезона
    original_title: '',    // Оригинальное название
    description: '',       // Описание
    release_year: '',      // Год релиза
    age_rating: '',        // Возрастной рейтинг (16+, 18+)
    external_rating: '',   // Рейтинг площадок (Кинопоиск/IMDb)
    total_episodes: '',    // Сколько эпизодов
    poster_url: '',        // Ссылка на постер
    status: 'вышел',       // Статус (вышел, анонсировано, выходит)
    duration: '',          // Указание времени (мин / сек)
    studio: '',            // Выбор студии
  });

  const handleSave = () => {
    console.log('Данные формы для отправки на бэкенд:', form);
    // Тут будет fetch запрос к adminApi.createSeason(form)
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* ХЕДЕР С КНОПКОЙ НАЗАД */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Добавление сезона</Text>
      </View>

      {/* 1. ВЫБОР ФРАНШИЗЫ И КНОПКА ДОБАВЛЕНИЯ */}
      <Text style={styles.fieldLabel}>Франшиза (Медиа-тайтл)</Text>
      <View style={styles.rowContainerGap}>
        <View style={styles.selectWrapper}>
          {/* Для веба используем нативный select, для мобилок можно кастомный селектор */}
          <select 
            value={form.media_id}
            onChange={(e) => setForm({ ...form, media_id: e.target.value })}
            style={styles.webSelect}
          >
            <option value="">Выберите франшизу...</option>
            <option value="1">Ход королевы</option>
            <option value="2">Адский рай</option>
            <option value="3">Человек-паук</option>
          </select>
        </View>
        <TouchableOpacity 
          style={styles.inlineAddButton}
          onPress={() => console.log('Открыть модалку добавления новой франшизы')}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 2. НАЗВАНИЯ И НОМЕР СЕЗОНА */}
      <View style={styles.rowContainerGap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Номер сезона</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: 1"
            placeholderTextColor="#666"
            value={form.season_number}
            onChangeText={(text) => setForm({ ...form, season_number: text })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 3 }}>
          <Text style={styles.fieldLabel}>Название сезона на русском</Text>
          <TextInput
            style={styles.input}
            placeholder="Оставьте пустым, если совпадает с франшизой"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Оригинальное название</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: The Queen's Gambit"
        placeholderTextColor="#666"
        value={form.original_title}
        onChangeText={(text) => setForm({ ...form, original_title: text })}
      />

      {/* 3. БОЛЬШОЕ ПОЛЕ ОПИСАНИЯ */}
      <Text style={styles.fieldLabel}>Описание сюжета</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Введите развернутое описание сезона..."
        placeholderTextColor="#666"
        multiline={true}
        numberOfLines={5}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      {/* 4. СТРОКА-МУЛЬТИКОНТЕЙНЕР (Год, Возраст, Рейтинг, Эпизоды) */}
      <View style={styles.rowContainerGap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Год релиза</Text>
          <TextInput
            style={styles.input}
            placeholder="2023"
            placeholderTextColor="#666"
            value={form.release_year}
            onChangeText={(text) => setForm({ ...form, release_year: text })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Возраст</Text>
          <TextInput
            style={styles.input}
            placeholder="18+"
            placeholderTextColor="#666"
            value={form.age_rating}
            onChangeText={(text) => setForm({ ...form, age_rating: text })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Рейтинг</Text>
          <TextInput
            style={styles.input}
            placeholder="8.5"
            placeholderTextColor="#666"
            value={form.external_rating}
            onChangeText={(text) => setForm({ ...form, external_rating: text })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Эпизоды</Text>
          <TextInput
            style={styles.input}
            placeholder="12, для фильмов оставьте пустым"
            placeholderTextColor="#666"
            value={form.total_episodes}
            onChangeText={(text) => setForm({ ...form, total_episodes: text })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* 5. УКАЗАНИЕ ВРЕМЕНИ И СТУДИЯ */}
      <View style={styles.rowContainerGap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Длительность серии</Text>
          <TextInput
            style={styles.input}
            placeholder="24 мин."
            placeholderTextColor="#666"
            value={form.duration}
            onChangeText={(text) => setForm({ ...form, duration: text })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Студия производства</Text>
           <View style={styles.selectWrapper}>
          {/* Для веба используем нативный select, для мобилок можно кастомный селектор */}
          <select 
            value={form.media_id}
            onChange={(e) => setForm({ ...form, media_id: e.target.value })}
            style={styles.webSelect}
          >
            <option value="">Выберите студию производства...</option>
            <option value="1">Ход королевы</option>
            <option value="2">Адский рай</option>
            <option value="3">Человек-паук</option>
          </select>
        </View>
        </View>
      </View>

      {/* 6. ВЫБОР СТАТУСА (ВЫШЕЛ / АНОНСИРОВАНО / ВЫХОДИТ) */}
      <Text style={styles.fieldLabel}>Статус релиза</Text>
      <View style={styles.statusGroup}>
        {['вышел', 'выходит', 'анонсировано'].map((statusOption) => {
          const isSelected = form.status === statusOption;
          return (
            <TouchableOpacity
              key={statusOption}
              style={[styles.statusRadio, isSelected && styles.statusRadioActive]}
              onPress={() => setForm({ ...form, status: statusOption })}
            >
              <Text style={[styles.statusRadioText, isSelected && styles.statusRadioTextActive]}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 7. ЗАГРУЗКА ПОСТЕРА ЧЕРЕЗ ССЫЛКУ С ПРЕВЬЮ */}
      <Text style={styles.fieldLabel}>Ссылка на постер сезона (URL-адрес)</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/poster.jpg"
        placeholderTextColor="#666"
        value={form.poster_url}
        onChangeText={(text) => setForm({ ...form, poster_url: text })}
      />
      
      {/* Блок автоматического превью картинки */}
      {form.poster_url ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Предварительный просмотр постера:</Text>
          <Image source={{ uri: form.poster_url }} style={styles.previewImage} resizeMode="contain" />
        </View>
      ) : null}

      {/* КНОПКА СОХРАНЕНИЯ ФОРМЫ */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <MaterialCommunityIcons name="content-save-outline" size={22} color="#FFF" />
        <Text style={styles.saveButtonText}>Сохранить сезон в систему</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border || 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: theme.card,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  rowContainerGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectWrapper: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  inlineAddButton: {
    backgroundColor: '#E50914',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statusRadio: {
    flex: 1,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusRadioActive: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  statusRadioText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  statusRadioTextActive: {
    color: '#E50914',
  },
  previewContainer: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  previewLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 140,
    height: 200,
    borderRadius: 6,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#E50914',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webSelect: {
    width: '100%',
    height: 48,
    backgroundColor: theme.card,
    color: theme.text,
    paddingHorizontal: 14,
    fontSize: 16,
    // Используем хак 'as any', чтобы TypeScript и React Native не ругались на веб-свойства
    ...Platform.select({
      web: {
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      } as any,
    }),
  },
});

