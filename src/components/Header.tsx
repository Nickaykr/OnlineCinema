import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { HeaderIconProps, HeaderProps } from '../../types/heder.types';
import { useTheme } from '../context/ThemeContext';
import { useMedia } from '../hooks/useMedia';
import { styles } from './Header.styles';

const HeaderIcon: React.FC<HeaderIconProps> = ({ onPress, icon, testID }) => (
  <TouchableOpacity
    style={styles.iconButton}
    onPress={onPress}
    testID={testID}
  >
    <Text style={styles.icon}>{icon}</Text>
  </TouchableOpacity>
);

const Header: React.FC<HeaderProps> = ({
  title,
  onMenuPress = () => {},
  onSearchPress = () => {},
  onProfilePress = () => {router.push('/account')},
  showSearch = true,
  showProfile = true,
  showBackButton = false,
}) => {
   const handleBackPress = () => {
    router.back(); 
  };

  const { theme, isDark, toggleTheme } = useTheme();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');


  //Логика Debounce: обновляем debouncedSearch только через 400мс после задержки ввода
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { media, loading } = useMedia({
    search: debouncedSearch,
    limit: 5
  });

  const closeSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.mainWrapper}>
      {/* Затемнение фона */}
      {isSearching && (
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={closeSearch}
          style={styles.overlay} 
        />
      )}

      <View style={styles.header}>
        <StatusBar barStyle="light-content" backgroundColor="#e50914" />
        
        {isSearching ? (
          <View style={styles.searchRow}>
            <HeaderIcon onPress={closeSearch} icon="←" />
            <TextInput
              style={styles.searchInputInHeader}
              placeholder="Поиск..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <HeaderIcon onPress={onMenuPress} icon="☰" testID="menu-button" />
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.rightIcons}>
              {showSearch && (
                <HeaderIcon onPress={() => setIsSearching(true)} icon="🔍" testID="search-button" />
              )}
              {showProfile && (
                <HeaderIcon onPress={onProfilePress} icon="👤" testID="profile-button" />
              )}
              <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
                <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Плашка результатов */}
      {isSearching && debouncedSearch.length >= 3 && (
        <View style={[styles.searchDropdown, { backgroundColor: isDark ? '#222' : '#fff' }]}>
          {loading ? (
            <Text style={styles.infoText}>Загрузка...</Text>
          ) : media && media.length > 0 ?(
            <FlatList
              data={media}
              keyExtractor={(item) => item.season_id.toString()}
              renderItem={({ item }) => (
                
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => { closeSearch(); router.push (`/MediaID/${item.season_id}}`); }}
                >
                  <Text style={[styles.resultTitle, { color: isDark ? '#fff' : '#000' }]}>
                    {item.main_title + ' ' + item.season_title}
                  </Text>
                </TouchableOpacity>
              )}
              
            />
          ) : (
            /* ЭТОТ БЛОК СРАБОТАЕТ, ЕСЛИ МАССИВ ПУСТОЙ */
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[
                styles.infoText, 
                { color: isDark ? '#fffdfd' : '#0a0a0a' } // Светло-серый для темной темы, темнее для светлой
              ]}>
                По запросу «{debouncedSearch}» ничего не найдено
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;