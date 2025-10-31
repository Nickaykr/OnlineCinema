import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface MenuItem {
  label: string;
  icon: string;
  onPress: () => void;
  isDestructive?: boolean;
}

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  menuItems?: MenuItem[];
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  isVisible, 
  onClose,
  menuItems = defaultMenuItems 
}) => {
  if (!isVisible) return null;

  const handleMenuItemPress = (item: MenuItem) => {
    item.onPress();
    onClose();
  };

  return (
    <>
      {/* Затемненный оверлей */}
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Боковое меню */}
      <View style={styles.menuContainer}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Меню приложения</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuContent}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.isDestructive && styles.destructiveMenuItem
              ]}
              onPress={() => handleMenuItemPress(item)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[
                styles.menuItemText,
                item.isDestructive && styles.destructiveText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.menuFooter}>
          <Text style={styles.footerText}>Версия 1.0.0</Text>
        </View>
      </View>
    </>
  );
};

const defaultMenuItems: MenuItem[] = [
  {
    label: 'Главная',
    icon: '🏠',
    onPress: () => console.log('Переход на главную'),
  },
  {
    label: 'Профиль',
    icon: '👤',
    onPress: () => console.log('Переход в профиль'),
  },
];

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.3,
    backgroundColor: 'white',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  destructiveMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  destructiveText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default SideMenu;