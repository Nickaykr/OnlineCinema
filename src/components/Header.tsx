import { router } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { HeaderIconProps, HeaderProps } from '../../types/heder.types';
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

  return (
    <View style={styles.header}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6200ee"
        translucent={false}
      />
      
      <HeaderIcon
        onPress={onMenuPress}
        icon="☰"
        testID="menu-button"
      />
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
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