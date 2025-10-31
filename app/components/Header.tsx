import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { HeaderIconProps, HeaderProps } from '../types/heder.types';
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
  onProfilePress = () => {},
  showSearch = true,
  showProfile = true,
}) => {
  return (
    <View style={styles.header}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6200ee"
        translucent={false}
      />
      
      {/* Левая часть - меню */}
      <HeaderIcon
        onPress={onMenuPress}
        icon="☰"
        testID="menu-button"
      />
      
      {/* Центральная часть - заголовок */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      {/* Правая часть - иконки */}
      <View style={styles.rightIcons}>
        {showSearch && (
          <HeaderIcon
            onPress={onSearchPress}
            icon="🔍"
            testID="search-button"
          />
        )}
        {showProfile && (
          <HeaderIcon
            onPress={onProfilePress}
            icon="👤"
            testID="profile-button"
          />
        )}
      </View>
    </View>
  );
};

export default Header;